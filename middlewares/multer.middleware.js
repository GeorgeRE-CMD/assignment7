import multer from "multer";
import { fileTypeFromFile } from 'file-type';
import fs from 'node:fs'
import fsPromise from 'node:fs/promises'
import crypto from 'crypto'
import { allowedExtensions } from "../config/system.config.js";

export const multerUpload = (desiredPath) => {
    const fullDestinationPath = `uploads/${desiredPath}`
    if (!fs.existsSync(fullDestinationPath)) {
        fs.mkdirSync(fullDestinationPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullDestinationPath)
        },
        filename: function (req, file, cb) {
            const suffix = crypto.randomBytes(5) + new Date.now();
            cb(null, `${suffix}___${file.originalname}`)
        }
    })
    const fileFilter = (req, file, cb) => {
        const result = fileTypeFromFile(file.originalname)
        const [fileType, fileExtension] = file.mimetype.split('/');
        const extenions = allowedExtensions[fileType]
        if (extenions.includes(fileExtension)) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }

    return multer({ fileFilter, storage })
}