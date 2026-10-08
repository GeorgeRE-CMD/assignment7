import mongoose from 'mongoose';
const url = process.env.URL
const dbName = process.env.DBNAME;
const connect = async () => {
    try {
        await mongoose.connect(`${url}${dbName}`);
        console.log('database connected successfully')
    } catch (error) {
        console.log('internal database error =>', error)
    }
}
export default connect;