import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        content: String,
        file: String,
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            select: false
        }
    }
)
export const Messages = mongoose.model("Message", messageSchema);