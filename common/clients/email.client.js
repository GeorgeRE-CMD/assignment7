import nodemailer from "nodemailer";
import { emailConfig } from "../../config/system.config.js";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.EMAIL_USER,
        pass: emailConfig.EMAIL_PASSWORD
    }
})