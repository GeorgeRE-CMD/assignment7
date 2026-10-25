import { isValidObjectId } from "mongoose";
import { UserRepository, userRepository } from "../../db/repositories/user.repository.js";
import { hash, verify } from "../../utils/hashing.js";
import { generateToken } from "../../utils/token/token.utils.js";
import { roles, tokenEnum } from "../../config/system.config.js";
import { v4 as uuidv4 } from 'uuid';
import { calculate, del, get, set } from "../../common/services/redis.services.js";
import crypto from 'crypto'
import { eventEmitter } from "../../common/services/email.service.js";
import { emailExpirationOtp } from "../../config/email.config.js";
import { BlogRepository } from "../../db/repositories/blog.repository.js";
// * signUp
const jwtConfig = roles
export const signUp = async (body) => {
    const { firstName, lastName, email, password, gender } = body;
    const existingUser = await userRepository.findOne({
        email
    });
    if (existingUser) {
        throw new Error('email already exists');
    }
    const hashedPassword = await hash(password);
    const user = await userRepository.create
        ({ firstName, lastName, email, password: hashedPassword, gender, role: 'user' })
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
    const otp = crypto.randomInt(100000, 100000).toString();
    const hashOtp = await hash(otp)
    eventEmitter.emit({
        to: email,
        subject: 'email verification',
        message: `<h1>this is your verification OTP</h1>
        <h2> ${otp}</h2>
        <h3>this otp for 5 minutes </h3>
        `
    })
    set({ key: `email_verification ${email}`, value: hashOtp, options: { EX: emailExpirationOtp } })
    return {
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            role: user.role
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
    if (!checkEmail) {
        throw new Error('Invalid email or password');
    }
    const checkPassword = await verify(
        password,
        checkEmail.password
    );
    if (!checkPassword) {
        throw new Error('Invalid email or password');
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
    set()
    if (!accessToken) throw new Error('token not found');
    const refreshToken = generateToken(
        payload,
        roleConfig.refresh_Token_Secret,
        { expiresIn: roleConfig.refresh_Token_Expire, refreshTokenId }
    );
    if (!refreshToken) throw new Error('token not found');
    await set(`access token : ${user._id}`, accessTokenId, { EX: 3600 })
    await set(`refresh token : ${user._id}`, refreshTokenId, { EX: 3600 })
    return {
        message: 'Login successful',
        accessToken,
        refreshToken
    };
};

export const confirmEmail = async (email, otp) => {
    const hashedOtp = get(`email_verification ${email}`)
    if (!hashedOtp) throw new Error ('otp has been expired');
    const isValidOtp = verify(hashedOtp, otp.toString())
    if(!isValidOtp) throw new Error ('invalid otp');
    await BlogRepository.update({email}, {isEmailVerified:true} )
    del(`email_verification ${email}`)
    return true
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