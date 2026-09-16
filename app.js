import express from 'express'
import connect from './db/db.connection.js';
import './db/models/user.model.js';
import userRouter from './moduels/users/users.controller.js';
const app = express();
const port = 3000;

app.use(express.json());
app.use('/user', userRouter);
app.use('/user', userRouter);
app.use('/user', userRouter);
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
startServer()