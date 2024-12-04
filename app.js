import express from "express";
import bodyParser from "body-parser";
import emailRouter from "./src/routes/emailSender.route.js";

const app = express();

app.use(bodyParser.json());
app.use(express.json());

app.use("/api/v0/email-send", emailRouter);

export { app };
