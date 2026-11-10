import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        identityRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Identity',
            required: true
        },
    },
    {
        timestamps: true
    }
)
export const Conversation = mongoose.model('Conversation', conversationSchema)