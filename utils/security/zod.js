import * as z from 'zod'

export const signInValidation = z.strictObject({
    email: z.email().trim().lowercase(),
    password: z.string().trim().min(4)
})

export const signUpValidation = z.strictObject({
    firstName: z.string().trim().regex(/^[a-zA-Z]+$/).min(4).max(10),
    lastName: z.string().trim().regex(/^[a-zA-Z]+$/).min(4).max(10),
    email: z.email().trim().lowercase(),
    password: z.string().trim().min(4),
    gender: z.enum(['male', 'female']).default('male')
})
export const confirmEmailValidation = z.object({
    email: z.string().trim().toLowerCase().email(),

    otp: z.string()
        .trim()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers')
});
export const updateUserValidation = z.strictObject({
    firstName: z.string().trim().min(4).max(10).regex(/^[a-zA-Z]+$/).optional(),
    lastName: z.string().trim().min(4).max(10).regex(/^[a-zA-Z]+$/).optional(),
    email: z.email().trim().lowercase().max(254).optional(),
    password: z.string().trim().min(8).max(100).optional(),
    gender: z.enum(['male', 'female']).optional()
});
export const passwordValidate = z.strictObject({
    oldPassword: z.string().trim().min(4),
    newPassword: z.string().trim().min(4),

})
export const deleteUserValidation = z.strictObject({
    id: z.string().refine(
        function (value) {
            return mongoose.isValidObjectId(value);
        },
        {
            message: 'Invalid user id'
        }
    )
});