import { emailProvider } from "../src/utils/index.util.js";

describe("Testing Provider 1 ", () => {
  it("testing provider 1 to return true from Math.random() >= 0.4", () => {
    jest.spyOn(global.Math, "random").mockImplementation(() => 0.5);
    expect(emailProvider[0]("email", "subject", "content")).toBe(true);
    Math.random.mockRestore();
  });

  it("testing provider 1 to return error from Math.random() < 0.4", () => {
    jest.spyOn(global.Math, "random").mockImplementation(() => 0.3);
    expect(() => emailProvider[0]("email", "subject", "content")).toThrow(
      "Provider 1 failed to send email",
    );
    Math.random.mockRestore();
  });
});

describe("Testing Provider 2 ", () => {
  it("testing provider 1 to return true from Math.random() >= 0.4", () => {
    jest.spyOn(global.Math, "random").mockImplementation(() => 0.5);
    expect(emailProvider[1]("email", "subject", "content")).toBe(true);
    Math.random.mockRestore();
  });

  it("testing provider 1 to return error from Math.random() < 0.4", () => {
    jest.spyOn(global.Math, "random").mockImplementation(() => 0.3);
    expect(() => emailProvider[1]("email", "subject", "content")).toThrow(
      "Provider 2 failed to send email",
    );
    Math.random.mockRestore();
  });
});
