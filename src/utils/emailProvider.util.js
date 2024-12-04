const provider1 = (email, subject, content) => {
  console.log("Provider 1 is attemting to send email.");
  if (Math.random() < 0.4) {
    throw new Error("Provider 1 failed to send email");
  }
  console.log("Email sent by provider 1");
  return true;
};

const provider2 = (email, subject, content) => {
  console.log("Provider 2 is attemting to send email.");

  if (Math.random() < 0.4) {
    throw new Error("Provider 2 failed to send email");
  }
  console.log("Email sent by provider 2");
  return true;
};

const emailProvider = [provider1, provider2];

export { emailProvider };
