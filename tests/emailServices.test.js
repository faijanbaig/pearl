import { emailService } from "../src/services/emailService.service.js";

test("Exponential Delay Check", () => {
  jest.useFakeTimers();
  const delayInMs = Math.pow(2, 2) * 1000;
  const promise = emailService.expoDelay(2);

  jest.advanceTimersByTime(delayInMs);
  7;
  expect(promise).resolves.toBeUndefined();
  jest.useRealTimers();
});

describe("EmailService - switchEmailProvider", () => {
  beforeEach(() => {
    jest
      .spyOn(emailService, "expoDelay")
      .mockImplementation(() => Promise.resolve());
    emailService.currProviderIndex = 0;
  });

  it("should switch to the next provider", () => {
    emailService.providers = ["ProviderA", "ProviderB", "ProviderC"];
    emailService.switchEmailProvider();
    expect(emailService.currProviderIndex).toBe(1);
  });

  it("should wrap around to the first provider after the last provider", () => {
    emailService.providers = ["ProviderA", "ProviderB", "ProviderC"];
    emailService.currProviderIndex = 2;
    emailService.switchEmailProvider();
    expect(emailService.currProviderIndex).toBe(0);
  });

  it("should handle a single provider array correctly", () => {
    emailService.providers = ["ProviderA"];
    emailService.switchEmailProvider();
    expect(emailService.currProviderIndex).toBe(0);
  });
});

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
    jest.restoreAllMocks(); // Restoring mocks after each test to avoid interference
  });

  it("should retry up to maxTries = 3 times on failure", async () => {
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

  it("should switch providers on 1 Attempt failure", async () => {
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
    ).rejects.toThrow();

    expect(emailService.emailStatus.get("test@example.com").attempts).toBe(3);
  });
});

describe("sendEmail", () => {
  beforeEach(() => {
    jest
      .spyOn(emailService, "expoDelay")
      .mockImplementation(() => Promise.resolve());
    emailService.emailStatus = new Map();
    emailService.rateLimiting = jest.fn();
    emailService.attemptToSend = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should send an email successfully", async () => {
    emailService.attemptToSend.mockResolvedValue(true);

    const response = await emailService.sendEmail(
      "test@example.com",
      "Test",
      "Hello",
    );

    expect(response).toBe(true);
    expect(emailService.attemptToSend).toHaveBeenCalledWith(
      "test@example.com",
      "Test",
      "Hello",
    );
    expect(emailService.emailStatus.has("test@example.com")).toBeTruthy();
  });

  it("should prevent duplicate email requests", async () => {
    emailService.emailStatus.set("test@example.com", "Test");
    jest.spyOn(console, "log").mockImplementation(() => {});
    const response = await emailService.sendEmail(
      "test@example.com",
      "Test",
      "Hello",
    );

    expect(response).toBeUndefined();
    expect(emailService.attemptToSend).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Duplicate request restricted !");
  });

  it("should delete status and throw an error if email sending fails", async () => {
    emailService.attemptToSend.mockRejectedValue(new Error("Sending failed"));

    await expect(
      emailService.sendEmail("test@example.com", "Test", "Hello"),
    ).rejects.toThrow(
      "Something went wrong while sending email after multiple requests !",
    );

    expect(emailService.emailStatus.has("test@example.com")).toBeFalsy();
  });
});
