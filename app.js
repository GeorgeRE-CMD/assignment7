import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import connect from './db/db.connection.js';
import './db/models/user.model.js';
import userRouter from './moduels/users/users.controller.js';
import { connectToRedis } from './common/clients/redis.connection.js';
import { createRateLimiter } from './middlewares/ratelimiter.middleware.js';

const app = express();

const port = Number(process.env.PORT) || 3000;

const startServer = async function () {
    try {
        // 1. Connect to MongoDB
        await connect();

        // 2. Connect to Redis
        await connectToRedis();

        // 3. Register middlewares
        app.use(helmet(), createRateLimiter);
        app.use(express.json());

        // 4. Register routes
        app.use('/user', userRouter);

        // 5. Start the server
        app.listen(port, function () {
            console.log(`Server is listening on port ${port}`);
        });

    } catch (error) {
        console.error('Server internal error:', error);
        process.exit(1);
    }
};

await startServer();