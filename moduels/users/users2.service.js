import { isValidObjectId } from "mongoose";
import { userRepository } from "../../db/repositories/user.repository.js";
import { hash, verify } from "../../utils/hashing.js";
import { generateToken, verifyToken } from "../../utils/token/token.utils.js";
import { roles, tokenEnum } from "../../config/system.config.js";
import { v4 as uuidv4 } from 'uuid';
import { calculate, del, expire, get, incr, set } from "../../common/services/redis.services.js";
import crypto from 'crypto'
import { sendEmail } from "../../common/services/email.service.js";
// * signUp
const jwtConfig = roles
export const signUp = async (body) => {
    console.log('1')
    const { firstName, lastName, email, password, gender } = body;
    console.log('2')
    const existingUser = await userRepository.findOne({
        email
    });
    console.log('3')
    if (existingUser) {
        throw new Error('email already exists');
    }
    const hashedPassword = await hash(password);
    console.log('4')
    const user = await userRepository.create
        ({ firstName, lastName, email, password: hashedPassword, gender, isEmailVerified: false, role: 'user' })
    console.log('5')
    const otp = crypto.randomInt(100000, 1000000).toString();
    console.log('6')
    const OTPhashed = await hash(otp);
    console.log('7')
    await set(`user_email___${email}`, OTPhashed, { EX: 300 })
    console.log('8')
    try {
        await sendEmail({
            to: email,
            subject: 'validation confirmation',
            message: 'otp',
            html: `<h1>${otp}</h1>`
        })
    } catch (error) {
        console.log('send email failed', error)
    }
    console.log('9')
    return {
        message: 'OTP sent successfully',
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            role: user.role
        }
    };
}

export const confirmEmail = async (email, otp) => {
    const user = await userRepository.findOne({
        email: email.trim()
    });
    if (!user) throw new Error('User not found');
    if (user.isEmailVerified) throw new Error('email has already been verified');
    const hashedOTP = await get(`user_email___${email}`)
    if (!hashedOTP) throw new Error('otp has been expired');
    const isValidOtp = await verify(hashedOTP, otp.toString());
    if (!isValidOtp) throw new Error('invalid otp');
    await userRepository.updateOne({ email }, { isEmailVerified: true });
    const roleConfig = jwtConfig[user.role];
    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role
    }
    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();
    const accessToken = generateToken(
        payload,
        roleConfig.access_Token_Secret,
        { expiresIn: roleConfig.access_Token_Expire, jwtid: accessTokenId }
    );
    const refreshToken = generateToken(
        payload,
        roleConfig.refresh_Token_Secret,
        { expiresIn: roleConfig.refresh_Token_Expire, jwtid: refreshTokenId }
    );
    await set(`access token : ${user._id}`, accessTokenId, { EX: 3600 });
    await set(`refresh token : ${user._id}`, refreshTokenId, { EX: 3600 });
    await del(`user_email___${email}`);
    return {
        message: 'Email verified successfully',
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            isEmailVerified: true
        },
        accessToken,
        refreshToken
    };
}
// * signIn
export const signIn = async function (body) {
    const { email, password } = body;
    const checkEmail = await userRepository.findOne(
        { email },
        '+password'
    );
    const identifier = checkEmail
        ? `user:${checkEmail._id}`
        : `email:${email}`;
    const attemptsKey = `login_attempts:${identifier}`;
    const bannedKey = `banned:${identifier}`;
    const isBanned = await get(bannedKey);

    if (isBanned) {
        throw new Error('Account temporarily locked');
    }
    const checkPassword = checkEmail
        ? await verify(password, checkEmail.password)
        : false;
    if (!checkEmail || !checkPassword) {
        const attempts = await incr(attemptsKey);
        if (attempts === 1) await expire(attemptsKey, 300);
        if (attempts === 5) {
            await set(bannedKey, 'banned', { EX: 300 });
            await del(attemptsKey)
            throw new Error('Too many failed login attempts. Try again after 5 minutes.');
        }
        throw new Error('invalid email or password')
    }
    const roleConfig = jwtConfig[checkEmail.role];
    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();
    const payload = {
        _id: checkEmail._id.toString(),
        email: checkEmail.email,
        role: checkEmail.role
    };
    const accessToken = generateToken(
        payload,
        roleConfig.access_Token_Secret,
        { expiresIn: roleConfig.access_Token_Expire, accessTokenId }
    );
    if (!accessToken) throw new Error('token not found');
    const refreshToken = generateToken(
        payload,
        roleConfig.refresh_Token_Secret,
        { expiresIn: roleConfig.refresh_Token_Expire, refreshTokenId }
    );
    if (!refreshToken) throw new Error('token not found');
    await set(`access token : ${checkEmail._id}`, accessTokenId, { EX: 3600 })
    await set(`refresh token : ${checkEmail._id}`, refreshTokenId, { EX: 3600 })
    return {
        message: 'Login successful',
        accessToken,
        refreshToken
    };
};


// * otp 2fa
export const sendOtp2fa = async (body) => {
    const { email, password } = body;
    const user = await userRepository.findOne({ email }, '+password');
    if (!user) throw new Error('invalid email or passwrd');
    const verifyPassword = await verify(password, user.password);
    if (!verifyPassword) throw new Error('invalid email or passsword');
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashOtp = await hash(otp);
    sendEmail({
        to: user.email,
        subject: 'verification confirmation',
        message: 'otp',
        html: ` <h>${otp}</h>`
    })
    const challengeId = uuidv4()
    await set(`2fa:login:${challengeId}`, hashOtp, { EX: 300 });
    return ({
        message: 'otp has been sent successfully',
        challengeId
    })
}

// * verifyOtp2fa

export const verifyOtp2fa = async function (body, challengeToken) {
    const { otp } = body;

    // 1. Validate challenge token
    const decoded = verifyToken(
        challengeToken,
        process.env.TWO_FA_SECRET
    );

    if (decoded.purpose !== '2fa' || !decoded.challengeId) {
        throw new Error('Invalid challenge');
    }

    // 2. Redis keys
    const redisKey = `2fa:login:${decoded.challengeId}`;
    const attemptsKey = `2fa:attempts:${decoded.challengeId}`;

    // 3. Get hashed OTP
    const redisOtp = await get(redisKey);

    if (!redisOtp) {
        throw new Error('OTP expired or invalid challenge');
    }

    // 4. Verify OTP
    const isOtpValid = await verify(otp, redisOtp);

    if (!isOtpValid) {
        const attempts = await incr(attemptsKey);

        if (attempts === 1) {
            await expire(attemptsKey, 300);
        }

        if (attempts >= 3) {
            await del(redisKey);
            await del(attemptsKey);

            throw new Error('Your OTP has expired');
        }

        throw new Error('Invalid OTP');
    }

    // 5. Find user
    const user = await userRepository.findById(decoded.sub);

    if (!user) {
        await del(redisKey);
        await del(attemptsKey);

        throw new Error('User not found');
    }

    // 6. Delete challenge
    await del(redisKey);
    await del(attemptsKey);

    // 7. Generate tokens
    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role
    };

    const roleConfig = jwtConfig[user.role];

    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();

    const accessToken = generateToken(
        payload,
        roleConfig.access_Token_Secret,
        {
            expiresIn: roleConfig.access_Token_Expire,
            jwtid: accessTokenId
        }
    );
    const refreshToken = generateToken(
        payload,
        roleConfig.refresh_Token_Secret,
        {
            expiresIn: roleConfig.refresh_Token_Expire,
            jwtid: refreshTokenId
        }
    );
    return {
        message: 'OTP verified successfully',
        accessToken,
        refreshToken
    };
};
;
// * change email

export const verifyNewEmail = async (body) => {
    const { _id, otp } = body;
    const redisKey = `userId__${_id}`;
    const data = await get(redisKey);
    if (!data) {
        throw new Error('OTP expired or not found');
    }
    const pendingData = JSON.parse(data);
    const check = await verify(otp, pendingData.hashOtp);
    if (!check) {
        throw new Error('Invalid OTP');
    }

    const existingUser = await userRepository.findOne({
        email: pendingData.email
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }
    const result = await userRepository.updateOne(
        { _id },
        { $set: { email: pendingData.email } },
        { runValidators: true }
    );
    await del(redisKey);

    return {
        message: 'Email has been changed successfully',
        newEmail: pendingData.email
    };
}
export const changeEmail = async (body) => {
    const { _id, email } = body
    const user = await userRepository.findOne({ _id });
    if (!user) throw new Error('user not found');
    const checkEmail = await userRepository.findOne({ email });
    if (email === user.email) throw new Error('email already exists');
    if (checkEmail) throw new Error('email already exists');
    const OTP = crypto.randomInt(100000, 1000000).toString();
    const hashOtp = await hash(OTP);
    const pendingData = {
        email,
        hashOtp
    };
    await set(`userId___${user._id}`, pendingData, { EX: 300 });
    try {
        await sendEmail({
            to: email,
            subject: 'Email verification',
            message: `Your OTP is ${OTP}`,
            html: `<h1>${OTP}</h1>`
        });
    } catch (error) {
        await del(redisKey);
        throw error;
    }
    return {
        message: "otp has been sent successfully",
        user: user.email,
    }
}

// * change password
export const changePassword = async (body) => {
    const { _id, oldPassword, newPassword } = body
    const user = await userRepository.findOne({ _id }, '+password');
    if (!user) throw new Error('user not found');
    const isOldPasswordValid = await verify(user.password, oldPassword);
    if (!isOldPasswordValid) {
        throw new Error('Old password is incorrect');
    }
    const isSamePassword = await verify(user.password, newPassword);
    if (isSamePassword) {
        throw new Error('New password must be different');
    }
    const hashedPassword = await hash(newPassword);
    await userRepository.updateOne(
        { _id },
        { $set: { password: hashedPassword } },
        { runValidators: true }

    );
    await redis.del(`access token :${_id}`);
    await redis.del(`refresh token :${_id}`);
    if (result.matchedCount === 0) {
        throw new Error('User not found');
    }
    return {
        message: 'password has been changed'
    }
}

// * forget password
export const forgetPassword = async (body) => {
    const { email } = body;
    const user = await userRepository.findOne({ email });
    if (!user) {
        return {
            message: 'If the email exists, you will receive an OTP'
        };
    }
    const OTP = crypto.randomInt(100000, 1000000).toString();
    const hashOtp = await hash(OTP);
    await set(`email___${email}`, hashOtp, { EX: 300 })
    try {
        await sendEmail({
            to: email,
            subject: 'verification',
            message: 'OTP',
            html: `<h1>${OTP}</h1>`
        })
    } catch (error) {
        await del(`email___${email}`);
        console.log('connaot send email', error)
        throw Error
    }
}

// * cofirm otp forget password
export const verifyForgetPassword = async function (body) {
    const { email, otp } = body;
    const otpKey = `email___${email}`;
    const storedOtpHash = await get(otpKey);
    if (!storedOtpHash) {
        throw new Error('Invalid or expired verification request');
    }
    const isOtpValid = await verify(storedOtpHash, otp);
    if (!isOtpValid) {
        throw new Error('Invalid or expired verification request');
    }
    const user = await userRepository.findOne({ email });
    if (!user) {
        throw new Error('Invalid or expired verification request');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = await hash(resetToken);
    const resetKey = `resetPassword:${user._id}`;
    await set(resetKey, hashedResetToken, { EX: 600 });
    await del(otpKey);
    return {
        message: 'OTP verified successfully',
        resetToken
    };
};


export const resetPassword = async function (body) {
    const { resetToken, newPassword } = body;

    // 1. Hash the reset token
    const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 2. Create Redis key
    const resetKey = `resetPassword:${hashedResetToken}`;

    // 3. Get user ID from Redis
    const userId = await get(resetKey);

    if (!userId) {
        throw new Error('Invalid or expired reset token');
    }

    // 4. Hash new password
    const hashedPassword = await hash(newPassword);

    // 5. Save new password in MongoDB
    const result = await userRepository.updateOne(
        { _id: userId },
        {
            $set: {
                password: hashedPassword
            }
        },
        {
            runValidators: true
        }
    );

    if (result.matchedCount === 0) {
        throw new Error('User not found');
    }

    // 6. Delete reset token
    await del(resetKey);

    // 7. Invalidate old sessions
    await del(`access token :${userId}`);
    await del(`refresh token :${userId}`);

    return {
        message: 'Password reset successfully'
    };
};

// * add profile pic
export const uploadProfilePic = async (file, user) => {
    return userRepository.updateOne(user._id, { profileImage: file.path }, { new: true });

}
// * signOut
export const signOut = async (accessTokenData, refreshTokenData) => {
    const { exp: accessExpiration, jti: accessId } = accessTokenData;
    const { exp: refreshExpiration, jti: refreshId } = refreshTokenData;
    const accessTTl = calculate(accessExpiration);
    const refreshTTL = calculate(refreshExpiration);
    Promise.all([
        set({ key: `${tokenEnum.ACCESS}_${accessId}`, value: true, options: { EX: accessTTl } }),
        set({ key: `${tokenEnum.REFRESH}_${refreshId}`, value: true, options: { EX: refreshTTL } }),
    ])
    return { message: 'logged out successfully', accessTTl, refreshTTL }
}

// * GetAllUsers

export const getAllUsers = async () => {
    return userRepository.findAll()
}

// * findById
export const getUserById = async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new Error("user not found");
    }

    return user;
};

// * updateUsers

export const updateUser = async (userId, body) => {
    if (!isValidObjectId(userId)) throw new Error('invalid user id');
    const { firstName, lastName, email, password, gender } = body;
    const updateData = {};
    if (firstName !== undefined) {
        updateData.firstName = firstName;
    }
    if (lastName !== undefined) {
        updateData.lastName = lastName;
    }
    if (email !== undefined) {
        updateData.email = email;
    }
    if (gender !== undefined) {
        updateData.gender = gender;
    }
    if (password !== undefined) {
        updateData.password = await hash(password);
    }
    if (password !== undefined) {
        updateData.password = await hash(password);
    }
    return userRepository.findByIdAndUpdate(userId, updateData);
}

// * deleteUser

export const deleteUser = async (userId) => {
    if (!isValidObjectId) throw new Error("invalid user id");
    return userRepository.findByIdAndDelete(userId)
}