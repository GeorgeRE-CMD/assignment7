import jwt from 'jsonwebtoken';
import { roles } from '../../config/system.config.js';
import { get } from '../../common/services/redis.services.js';
const jwtConfig = roles
export const generateToken = (payload, secretKey, options) => {
    return jwt.sign(payload, secretKey, options)
}

export const verifyToken = (token, secretKey) => {
    return jwt.verify(token, secretKey)

}

export const decodeToken = async ({ token, tokenType }) => {
    const decode = jwt.decode(token);
    if (!decode) throw new Error("invalid token format");
    const role = jwtConfig[decode.role];
    if (!role) throw new Error('invalid role')
    let signature;
    switch (tokenType) {
        case "access":
            signature = role.access_Token_Secret
            break;
        case "refresh":
            signature = role.refresh_Token_Secret
            break;
        default:
            throw new Error('invalid signature');
    }
    const tokenVerify = verifyToken(token, signature);
    const isTokenListed = await get(`bl${tokenType}_${tokenVerify._jti}`);
    if (isTokenListed) throw new Error ('this token is revoked to re log-in')
    if (tokenVerify.role !== decode.role) {
        throw new Error("Invalid token role");
    }
    return (tokenVerify);
}