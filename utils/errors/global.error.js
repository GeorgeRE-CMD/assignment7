export class HttpAppError extends Error{
    message;
    statusCode;
    data;
    code;
    constructor(message, statusCode = 400, data = {}, code = 'bad request') {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.data = data
        this.code = code
    }
}

