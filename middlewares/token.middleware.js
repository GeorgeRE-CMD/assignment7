// token.middleware.js
import { verifyToken } from "../utils/token/token.utils.js";
export const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw new Error('aithorization header missing');
    }
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
        throw new Error("Invalid authorization header");
    }
    const decodeToken = verifyToken(token, process.env.JWT_SECRET)
    const user = await getUserById(decodeToken._id);
    req.userAuth = user
    next()
}