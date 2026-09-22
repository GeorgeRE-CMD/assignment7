// import User from "../../db/models/user.model.js";
// import { hash, verify } from "../../utils/hashing.js";

// // * signUp
// export const signUp = async (body) => {
//     const { firstName, lastName, email, password, gender, isActive } = body;
//     const emailExist = await User.findOne({ email });
//     if (emailExist) {
//         throw new Error('email already exists');
//     }
//     const hashedPassword = await hash(password)
//     const newUser = await User.create({
//         firstName,
//         lastName,
//         email,
//         password: hashedPassword,
//         gender,
//         isActive
//     });
//     return newUser;
// }
// // * signIn
// export const signIn = async (body) => {
//     const { email, password } = body;
//     const user = await User.findOne({ email });
//     const matchPasswords = await verify(user.password, password);
//     if (!user) {
//         throw new Error('invalid email or password');
//     }
//     if (!matchPasswords) {
//         throw new Error('invalid email or password');
//     }
//     return user
// }
// // * update user by ID

// export const updateUser = async (body, userId) => {
//     const { firstName, lastName, email, password, gender } = body;
//     return User.findByIdAndUpdate(userId, { firstName, lastName, email, password, gender },
//         { new: true, runValidators: true })
// }

// // * delete user by ID

// export const deleteuser = async (userId) => {
//     return await User.findByIdAndDelete(userId);
// }