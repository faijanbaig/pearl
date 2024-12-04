import { emailProvider } from "../src/utils/index.util.js";
import { emailService } from "../src/services/emailService.service.js";

test("Email provider 1 Check", () => {
  const result = emailProvider[0];

  expect(result("email", "subject", "content")).toEqual(true);
});

test("Email provider 2 Check", () => {
  const result = emailProvider[1];

  expect(result("email", "subject", "content")).toEqual(true);
});

jest.useFakeTimers();

test("Exponential Delay Check", () => {
  const delayInMs = Math.pow(2, 2) * 1000;
  const promise = emailService.expoDelay(2);

  jest.advanceTimersByTime(delayInMs);

  expect(promise).resolves.toBeUndefined();
});

jest.useRealTimers();

describe("rateLimiting", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    emailService.rateLimit = {
      maxRequests: 2,
      requestCount: 0,
      resetTime: 1000,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should throw an error when the max request limit is exceeded", () => {
    emailService.rateLimit.requestCount = emailService.rateLimit.maxRequests;

    expect(() => {
      emailService.rateLimiting();
    }).toThrow("Exceeds max requests. Pls try again later !");
  });

  it("should increment request count and decrement after resetTime", () => {
    emailService.rateLimiting();
    expect(emailService.rateLimit.requestCount).toBe(1);

    jest.advanceTimersByTime(emailService.rateLimit.resetTime);

    expect(emailService.rateLimit.requestCount).toBe(0);
  });

  it("should allow requests within the limit", () => {
    emailService.rateLimiting();
    emailService.rateLimiting();

    expect(emailService.rateLimit.requestCount).toBe(2);
  });
});

/*to fix this test case */
describe("attemptToSend", () => {
  beforeEach(() => {
    jest
      .spyOn(emailService, "expoDelay")
      .mockImplementation(() => Promise.resolve());
    emailService.emailStatus = new Map();
    emailService.providers = [jest.fn(), jest.fn()];
    emailService.currProviderIndex = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should retry up to maxTries times on failure", async () => {
    emailService.providers[0].mockImplementation(() => {
      throw new Error("Provider 1 failed to send email");
    });
    emailService.providers[1].mockImplementation(() => {
      throw new Error("Provider 2 failed to send email");
    });

    await expect(
      emailService.attemptToSend("test@example.com", "Subject", "Content"),
    ).rejects.toThrow();

    expect(emailService.providers[0]).toHaveBeenCalledTimes(2);
    expect(emailService.providers[1]).toHaveBeenCalledTimes(1);
  });

  it("should switch providers on failure", async () => {
    emailService.providers[0].mockImplementation(() => {
      throw new Error("Provider 1 failed");
    });
    emailService.providers[1].mockImplementation(() => true);

    const response = await emailService.attemptToSend(
      "test@example.com",
      "Subject",
      "Content",
    );

    expect(response).toBe(true);
    expect(emailService.currProviderIndex).toBe(1);
  });

  it("should apply exponential delay on retries", async () => {
    emailService.providers[0].mockImplementation(() => {
      throw new Error("Provider 1 failed to send email");
    });
    emailService.providers[1].mockImplementation(() => {
      throw new Error("Provider 2 failed to send email");
    });

    await expect(
      emailService.attemptToSend("test@example.com", "Subject", "Content"),
    ).rejects.toThrow();

    expect(emailService.expoDelay).toHaveBeenCalledWith(1);
    expect(emailService.expoDelay).toHaveBeenCalledWith(2);
  });

  it("should delete email status on success", async () => {
    emailService.emailStatus.set("test@example.com", { attempts: 0 });
    emailService.providers[0].mockImplementation(() => true);

    const response = await emailService.attemptToSend(
      "test@example.com",
      "Subject",
      "Content",
    );

    expect(response).toBe(true);
    expect(emailService.emailStatus.has("test@example.com")).toBe(false);
  });

  it("should throw an error if all attempts fail", async () => {
    emailService.providers[0].mockImplementation(() => {
      throw new Error("Provider 1 failed to send email");
    });
    emailService.providers[1].mockImplementation(() => {
      throw new Error("Provider 2 failed to send email");
    });

    await expect(
      emailService.attemptToSend("test@example.com", "Subject", "Content"),
    ).rejects.toThrow("Provider 2 failed");

    expect(emailService.emailStatus.get("test@example.com").attempts).toBe(3);
  });
});
