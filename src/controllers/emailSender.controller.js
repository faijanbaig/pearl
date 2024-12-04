import { ApiResponse, asyncHandler } from "../utils/index.util.js";
import { emailService } from "../services/emailService.service.js";

const emailSendController = asyncHandler(async (req, res) => {
  const { email, subject, content } = req.body;
  const result = await emailService.enqueue(email, subject, content);
  if (result) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email sent successfully"));
  } else {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to send email."));
  }
});

export { emailSendController };
