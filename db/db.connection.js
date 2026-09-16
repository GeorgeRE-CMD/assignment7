import mongoose from 'mongoose';

const url = 'mongodb://127.0.0.1:27017/'
const dbName = 'saraha-app';

const connect = async () => {
    try {
        await mongoose.connect(`${url}${dbName}`);
        console.log('database connected successfully')
    } catch (error) {
        console.log('internal database error =>', error)
    }
}

export default connect;