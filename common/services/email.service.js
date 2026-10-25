import { email } from "../../config/system.config";
import { emailTransporter } from "../clients/email.client.js"
import { EventEmitter } from "node:events";
export const sendEmail = async function ({
    to,
    subject = "No reply",
    message = "",
    attachments = []
}) {
    if (!message && !attachments.length) {
        throw new Error("Message or attachments are required");
    }
    try {
        const info = await emailTransporter.sendMail({
            from: `"Example Team" <${email.user}>`,
            to,
            subject,
            html: message,
            attachments
        });
        console.log("Message sent:", info.messageId);
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (err) {
        console.error("Error while sending mail:", {
            code: err.code,
            responseCode: err.responseCode,
            response: err.response
        });
        throw err;
    }
};


export const eventEmitter = new EventEmitter();
EventEmitter.on('send email event', ({ to,
    subject = "No reply",
    message = "",
    attachments = [] }) => {
    sendEmail({
        to,
        subject,
        message,
        attachments
    })
    console.log('data recieved successfully')
})

