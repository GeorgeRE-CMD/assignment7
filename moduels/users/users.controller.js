import { Router } from "express";
import { changeEmail, changePassword, confirmEmail, forgetPassword, resetPassword, signIn, signOut, signUp, updateUser, verifyForgetPassword, verifyNewEmail } from "./users2.service.js";
import { validation } from "../../middlewares/zod.middleware.js";
import { confirmEmailValidation, deleteUserValidation, passwordValidate, signInValidation, signUpValidation, updateUserValidation } from "../../utils/security/zod.js";
import { authenticate } from "../../middlewares/token.middleware.js";
import { refreshAuthenticate } from "../../middlewares/refresh.middleware.js";
import { fileTypeFromFile } from 'file-type';
import { multerUpload } from "../../middlewares/multer.middleware.js";
const userRouter = Router();

// * SIGN-UP
userRouter.post('/sign-up', validation(signUpValidation), async (req, res) => {
    try {
        console.log('SIGNUP DATA:', req.validate);
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
        });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: error.message })
        res.status(400).json({ message: error.message })
    }
})
userRouter.post('/confirm-email', validation(confirmEmailValidation), async (req, res) => {
    console.log('CONFIRM EMAIL DATA:', req.validate);
    const { email, otp } = req.validate;
    const result = await confirmEmail(email, otp);
    return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
    })
})
// * change email

userRouter.patch('/change-email', authenticate, async (req, res) => {
    const { _id } = req.user;
    const result = await changeEmail({ _id }, req.body.email)
    res.status(200).json({ message: 'otp sent successfully', email: req.body.email })
})

// * verify new email
userRouter.patch('/verify-new-email', authenticate, validation(confirmEmailValidation), async (req, res) => {
    const result = await verifyNewEmail({
        id: req.user._id,
        otp: req.validate.otp
    })
    res.status(200).json({
        success: true,
        message: 'Email changed successfully'
    });
})
// * change password
userRouter.patch('/change-password', authenticate, validation(passwordValidate), async (req, res) => {
    const { _id } = req.user;
    const { oldPassword, newPassword } = req.validate
    const result = await changePassword({ _id, oldPassword, newPassword })
    res.status(200).json({ message: 'password changed successfully' })
})

// * forget password

userRouter.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    const result = await forgetPassword({ email });
    res.status(200).json(result)
})
userRouter.post('/verifyForgetPassword', async (req, res) => {
    const { email, otp } = req.body;
    const result = await verifyForgetPassword({ email, otp });
    res.status(200).json(result)
})

userRouter.patch('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    const result = await resetPassword({
        resetToken,
        newPassword
    });

    res.status(200).json(result);
});

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
// * add file
userRouter.post('/add-file', multerUpload({ desiredPath: '/covers' }).single('image'), async (req, res) => {
    const result = await fileTypeFromFile(req.file.path);
    res.status(200).json({message:"file has added successfully", data:req.file, result})
})
userRouter.post('/profile_picture', multerUpload({ desiredPath: '/profile' }).single('profile'), async (req, res) => {
    const file = req.file;
    const {authUser} = req 
    const result = await upladProfilePic(file, authUser)
    res.status(200).json({message:"profile picture is uploaded successfully", result})
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