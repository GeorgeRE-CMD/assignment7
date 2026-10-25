import { decodeToken } from "../utils/token/token.utils.js";

export const refreshAuthenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) throw new Error('authorization header is missing')
    const [prefix, token] = authorization.split(' ');
    if (prefix !== "Bearer" || !token) {
        throw new Error("Invalid authorization header");
    }
    const decode = await decodeToken({ token, tokenType: "refresh" });
    req.refreshUser = decode;
    req.refreshToken = token;
    next()
}