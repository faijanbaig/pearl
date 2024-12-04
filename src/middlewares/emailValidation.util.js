import { ApiError } from "../utils/index.util.js";

const emailValidation = (req, res, next) => {
  const { email, subject, content } = req.body;
  if (
    [email, subject, content].some(
      (field) => field === undefined || field === "",
    )
  ) {
    throw new ApiError(400, "All fields are required !");
  }
  next();
};

export { emailValidation };
