import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: [4],
            maxLength: [10],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[a-zA-Z]+$/.test(value);
                }
            }
        },
        lastName: {
            type: String,
            required: true,
            minLength: [4],
            maxLength: [10],
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minLength: [4],
            trim: true
        },
        gender: {
            type: String,
            required: true,
            trim: true,
            enum: ['male', 'female'],
            default: 'male'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        virtuals: {
            fullName: {
                get() {
                    return `fullName is => ${this.firstName}  ${this.lastName}`
                }
            }
        },
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)
userSchema.query.firstName = function () {
    return this.where({ firstName: /^[a-dA-D]/ });
}
const User = mongoose.model('User', userSchema);
export default User;