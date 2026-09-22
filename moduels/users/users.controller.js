import { Router } from "express";
import { signIn, signUp, updateUser } from "./users2.service.js";

const userRouter = Router();

// * SIGN-UP
userRouter.post('/sign-up', async (req, res) => {
    try {
        const { firstName, lastName, email, password, gender, isActive } = req.body
        const result = await signUp({ firstName, lastName, email, password, gender, isActive });
        res.status(201).json({
            id: result._id,
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            gender: result.gender,
            isActive: result.isActive
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
    res.status(200).json({
        user: {
            message: 'user logged in successfully',

        }
    })
})

// * getAllUsers
userRouter.get("/users", async (req, res) => {
    const users = await getAllUsers();
    return res.status(200).json({ users });
});
// * UPDATE
userRouter.patch('update/:id', async (req, res) => {
    const userId = req.params.id;
    const result = await updateUser(userId, req.body);
    if (!result) {
        return res.status(404).json({
            message: 'User not found'
        });
    }
    res.status(200).json({
        message: "user has been updated", user: {
            id: result._id,
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            gender: result.gender
        }
    });
})

// * DELETE-USER
userRouter.deleteuser('delete/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({
            message: "User id is required"
        });
    }

    const result = await deleteuser(userId);
    if (!result) return res.status(404).json({ message: 'user not found' })
    res.status(200).json({ message: 'user has been deleted' })
})

userRouter.use((error, req, res, next) => {
    console.log(error)
    res.status(500).json({
        message: 'Internal server error'
    })
})

export default userRouter;