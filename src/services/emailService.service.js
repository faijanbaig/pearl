import { emailProvider } from "../utils/index.util.js";

class EmailService {
  constructor() {
    this.providers = emailProvider;
    this.currProviderIndex = 0;
    this.emailStatus = new Map();
    (this.rateLimit = {
      maxRequests: 10,
      requestCount: 0,
      resetTime: 1000,
    }),
      (this.queue = []);
    this.isProcessing = false;
  }

  async enqueue(email, subject, content) {
    this.queue.push({ email, subject, content });
    console.log(`${email} is queued.`);
    return await this.processQueue();
  }

  async processQueue() {
    while (this.queue.length > 0) {
      if (this.isProcessing) return;
      this.isProcessing = true;
      const { email, subject, content } = this.queue.shift();
      try {
        const response = await this.sendEmail(email, subject, content);
        this.isProcessing = false;
        return response;
      } catch (error) {
        console.log(`Failed to send email to ${email}`);
      }
    }
  }

  switchEmailProvider() {
    this.currProviderIndex =
      this.currProviderIndex === this.providers.length - 1
        ? 0
        : this.currProviderIndex + 1;
  }

  async expoDelay(attempt) {
    const delay = Math.pow(2, attempt) * 1000;
    return new Promise((resolve) => setTimeout(resolve, delay).unref());
  }

  rateLimiting() {
    if (this.rateLimit.requestCount >= this.rateLimit.maxRequests) {
      throw new Error("Exceeds max requests. Pls try again later !");
    }
    this.rateLimit.requestCount++;
    setTimeout(
      () => this.rateLimit.requestCount--,
      this.rateLimit.resetTime,
    ).unref();
  }

  async attemptToSend(email, subject, content) {
    const maxTries = 3;
    let attempts = 0;
    while (attempts < maxTries) {
      const provider = this.providers[this.currProviderIndex];
      try {
        const response = provider(email, subject, content);
        this.emailStatus.set(email, subject);

        return response;
      } catch (error) {
        attempts++;
        this.emailStatus.get(email).attempts = attempts;
        console.log(`Attempt ${attempts} failed . Swiching Provider !`);
        this.switchEmailProvider();

        await this.expoDelay(attempts);
      }
    }
  }

  async sendEmail(email, subject, content) {
    if (this.emailStatus.get(email) === subject) {
      console.log("Duplicate request restricted !");
      return;
    }
    this.emailStatus.set(email, { attempts: 0, status: "In-progress" });

    try {
      this.rateLimiting();
      return await this.attemptToSend(email, subject, content);
    } catch (error) {
      this.emailStatus.delete(email);
      throw new Error(
        "Something went wrong while sending email after multiple requests !",
      );
    }
  }
}

export const emailService = new EmailService();
