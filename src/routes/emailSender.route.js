import { Router } from "express";
import { emailValidation } from "../middlewares/emailValidation.util.js";
import { emailSendController } from "../controllers/emailSender.controller.js";

const router = Router();

router.route("/").post(emailValidation, emailSendController);

export default router;
