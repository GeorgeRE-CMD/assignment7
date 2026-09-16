import { Router } from "express";
import { deleteuser, signIn, signUp, updateUser } from "./users.service.js";

const userRouter = Router();

// * SIGN-UP
userRouter.post('/sign-up', async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, isActive } = req.body
        const result = await signUp({ firstName, lastName, email, password, gender, isActive });
        res.status(201).json({
            message: 'user has been added successfully',
            firstName,
            lastName,
            email,
            gender,
            isActive
        })
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: error.message })
        res.status(400).json({ message: error.message })
    }
})
// * SIGN-IN
userRouter.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }
    const result = await signIn({ email, password });
    res.status(200).json({ message: 'user logged in successfully', email })
})

// * UPDATE
userRouter.patch('update/:id', async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, password, gender } = req.body;
    const result = await updateUser(userId, { firstName, lastName, email, password, gender });
    if (!result) {
        return res.status(404).json({
            message: 'User not found'
        });
    }
    res.status(200).json({ message: `user has been updated`, firstName, lastName, email, gender });
})

// * DELETE-USER
userRouter.delete('delete/:id', async (req, res) => {
    const userId = req.params.id;
    const result = await deleteuser(userId);
    if (!result) return res.status(404).json({ message: 'user not found' })
    res.status(201).json({ message: 'user has been deleted' })
})

userRouter.use((error, req, res, next) => {
    console.log(error)
    res.status(500).json({
        message: 'Internal server error'
    })
})

export default userRouter;