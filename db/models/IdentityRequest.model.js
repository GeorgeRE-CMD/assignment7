import mongoose from "mongoose";

const identityRequestSchema = new mongoose.Schema(
    {
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true
        },
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }
)

export const Identity = mongoose.model('Identity', identityRequestSchema)