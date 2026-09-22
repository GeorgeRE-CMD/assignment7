import { isValidObjectId } from "mongoose";
import { userRepository } from "../../db/repositories/user.repository.js";
import { hash, verify } from "../../utils/hashing.js";
import { HttpAppError } from "../../utils/errors/global.error.js";

// * signUp
export const signUp = async (body) => {
    const { firstName, lastName, email, password, gender, isActive } = body;
    if (!firstName || !lastName || !email || !password) {
        throw new HttpAppError(
            "firstName, lastName, email and password are required"
        );
    }
    const existingUser = await userRepository.findOne({
        email
    });
    if (existingUser) {
        throw new HttpAppError ('email already exists', 409, {duplicatedEmail:email}, 'email conflict');
    }
    const hashedPassword = await hash(password);
    return await userRepository.create({ firstName, lastName, email, password: hashedPassword, gender })
}

// * signIp
export const signIn = async (body) => {
    const { email, password } = body;
    const checkEmail = await userRepository.findOne({ email }, "+password");
    if (!checkEmail) throw new Error('invalid email or password');
    const checkPassword = await verify(password, checkEmail.password);
    if (!checkPassword) throw new Error('invalid email or password');
    return {
        id: checkEmail._id,
        email: checkEmail.email
    }
}

// * GetAllUsers

export const getAllUsers = async () => {
    return userRepository.findAll()
}

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