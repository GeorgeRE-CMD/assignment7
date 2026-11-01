import { emailConfig } from "../../config/system.config.js"
import { transporter } from "../clients/email.client.js"

export const sendEmail = async ({ to, subject = 'no reply', message, html, attachments = [] }) => {
    try {
        if (!message && !attachments.length) throw new Error('message or attachments are required')
        const info = transporter.sendMail({
            from: emailConfig.EMAIL_USER,
            to,
            subject,
            message,
            html: html,
            attachments
        })
        return true
    } catch (error) {
        console.log('Error while sending mail:', error);
        throw error
    }
}