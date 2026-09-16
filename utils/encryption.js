import 'dotenv/config';
import crypto from 'node:crypto'
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
const IV_LENGTH = 16;
export function encryption(plainText) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypt = cipher.update(plainText, 'utf-8', 'hex');
    encrypt += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypt;
}
console.log('encrypted = >>>>>>>>>>>', encryption('hello world'))
export function decryption(text) {
    const [iv_, encryptedText] = text.split(':');
    const iv = Buffer.from(iv_, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypt = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypt += decipher.final('utf-8');
    return decrypt
}

console.log('decrypted',decryption('cf39418c5c8b123f1c4e37db7449330d:eaacb975c26fce7a3381ae11b1dc1901'))