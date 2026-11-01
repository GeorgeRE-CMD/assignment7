import 'dotenv/config';
export const roles = {
    user: {
        access_Token_Secret: process.env.USER_TOKEN_ENCRYPT_KEY,
        access_Token_Expire: process.env.USER_TOKEN_EXPIRE,
        refresh_Token_Secret: process.env.USER_REFRESH_TOKEN_ENCRYPT_KEY,
        refresh_Token_Expire: process.env.USER_REFRESH_TOKEN_EXPIRE
    },
    admin: {
        access_Token_Secret: process.env.ADMIN_TOKEN_ENCRYPT_KEY,
        access_Token_Expire: process.env.ADMIN_TOKEN_EXPIRE,
        refresh_Token_Secret: process.env.ADMIN_REFRESH_TOKEN_ENCRYPT_KEY,
        refresh_Token_Expire: process.env.ADMIN_REFRESH_TOKEN_EXPIRE
    }
}


export const redis = {
    URL: process.env.REDIS_URL
}
export const tokenEnum = Object.freeze({
    ACCESS: "access",
    REFRESH: "refresh"
})

export const emailConfig = {
    EMAIL_USER:process.env.EMAIL_USER,
    EMAIL_PASSWORD:process.env.EMAIL_PASS
}


export const allowedExtensions = {
    img: ['jpeg, png'],
    video: ['mp3, mp4'],
    files: 'pdf'
}