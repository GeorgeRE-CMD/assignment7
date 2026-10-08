import jwt from 'jsonwebtoken';

export const generateToken = (payload, secretKey, options) => {
    return jwt.sign(payload, secretKey, options)
}

export const verifyToken = (token, secretKey) => {
    return jwt.verify(token, secretKey)
    
}