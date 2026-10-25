import 'dotenv/config';
import { email } from './system.config.js';

export const emailConfig = {
    service: "gmail",
    auth: {
        user: email.user,
        pass: email.pass
    },
}

export const emailExpirationOtp = 300