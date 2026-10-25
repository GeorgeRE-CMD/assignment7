import 'dotenv/config'
import express from 'express'
import connect from './db/db.connection.js';
import './db/models/user.model.js';
import userRouter from './moduels/users/users.controller.js';
import { connectToRedis } from './common/clients/redis.connection.js';
import { emailTransporter } from './common/clients/email.client.js';
import { emailConfig } from './config/email.config.js';
const app = express();
const port = Number(process.env.PORT);

app.use(express.json());
app.use('/user', userRouter);
const startServer = async () => {
    try {
        await connect();
        app.listen(port, () => {
            console.log('server is listening on port 3000')
        });
    } catch (error) {
        console.log('server internal error', error);
    }
}
startServer();
connectToRedis();
console.log({
    userExists: Boolean(emailConfig.auth.user),
    passExists: Boolean(emailConfig.auth.pass)
});
try {
    await emailTransporter.verify();
    console.log("Server is ready to take our messages");
} catch (err) {
    console.error("Verification failed:", err);
}