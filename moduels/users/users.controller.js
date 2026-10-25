import { Router } from "express";
import { confirmEmail, signIn, signOut, signUp, updateUser } from "./users2.service.js";
import { validation } from "../../middlewares/zod.middleware.js";
import { deleteUserValidation, signInValidation, signUpValidation, updateUserValidation } from "../../utils/security/zod.js";
import { authenticate } from "../../middlewares/token.middleware.js";
import { refreshAuthenticate } from "../../middlewares/refresh.middleware.js";

const userRouter = Router();

// * SIGN-UP
userRouter.post('/sign-up', validation(signUpValidation), async (req, res) => {
    try {
        const result = await signUp(req.validate);
        res.status(201).json({
            message: 'created',
            user: {
                id: result.user._id,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                email: result.user.email,
                gender: result.user.gender,
                role: result.user.role
            },
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: error.message })
        res.status(400).json({ message: error.message })
    }
})
// * SIGN-IN
userRouter.post('/sign-in', validation(signInValidation), async (req, res) => {
    const result = await signIn(req.validate);
    res.status(200).json({
        user: {
            message: 'user logged in successfully',
            user: {
                email: result.email,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }
        }
    })
})

userRouter.post('/sign-out', authenticate, refreshAuthenticate, async (req, res) => {
    const result = await signOut({
        jti: req.user.jti,
        exp: req.user.exp
    },
        {
            jti: req.refreshUser.jti,
            exp: req.refreshUser.exp
        });
    res.status(200).json({ message: "logged out successfully", result })
})

userRouter.patch('/confirm-email', async (req, res) => {
    const { email, otp } = req.body;
    const result = await confirmEmail(email, otp);
    res.status(200).json({ message: 'email changed successfully', data: result })
})
// * getAllUsers
userRouter.get("/users", async (req, res) => {
    const users = await getAllUsers();
    return res.status(200).json({ users });
});


// *findById
userRouter.get('/profile', authenticate, async (req, res) => {
    res.status(200).json({ message: 'user profile retreived successfully', findUser, data: req.userAuth })
})


// * UPDATE
userRouter.patch('update', authenticate, validation(updateUserValidation), async (req, res) => {
    const result = await updateUser(req.userAuth, req.validate);
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
userRouter.delete('delete/:id', validation(deleteUserValidation), async (req, res) => {
    try {
        const result = await deleteuser(req.validate.id);
        if (!result) return res.status(404).json({ message: 'user not found' });
        res.status(200).json({ message: 'user has been deleted' });
    } catch (error) {
        console.log('user cannot be deleted', error);
    }
})

userRouter.use((error, req, res, next) => {
    console.log(error)
    res.status(500).json({
        message: 'Internal server error'
    })
})

export default userRouter;