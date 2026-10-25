// token.middleware.js
import { decodeToken } from "../utils/token/token.utils.js";
export const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw new Error('aithorization header missing');
    }
    const [prefix, token] = authorization.split(" ");

    if (prefix !== "Bearer" || !token) {
        throw new Error("Invalid authorization header");
    }
    const decode = await decodeToken({ token, tokenType: "access" })
    req.user = decode;
    req.token = token;
    next()
}