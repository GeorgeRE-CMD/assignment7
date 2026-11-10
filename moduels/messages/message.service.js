import { ConversationRepo } from "../../db/repositories/conversation.repo.js";
import { IdentityRepo } from "../../db/repositories/identity.repo.js";
import { MessageRepo } from "../../db/repositories/message.repository.js"
import { userRepository } from "../../db/repositories/user.repository.js"

export const sendMessage = async ({ content, file, receiverId, senderId }) => {
    const user = await userRepository.findById(receiverId);
    if (!user) throw new Error('reciever not found');
    return MessageRepo.create({ content, file: file?.path, receiverId, senderId });
}

export const getMessagesByRecieverId = async (receiverId) => {
    return await userRepository.findAll({ receiverId });
}

export const accept = async (identityRequestId, recipientId) => {
    const result = await IdentityRepo.updateStatus(
        {
            _id: identityRequestId,
            recipient: recipientId,
            status: 'pending'
        },
        'accepted'
    );
    if (!result) {
        throw new Error('Request not found or unauthorized');
    }
    return result;
};

export const reject = async (receiverId, senderId) => {
    const getDocument = await IdentityRepo.findById({ senderId });
    if (getDocument.status === 'rejected') {
        return await IdentityRepo.findByIdAndDelete({ senderId });
    }
}

export const createConversation = async (identityRequestId, currentUserId) => {
    const conversation = await IdentityRepo.findById(identityRequestId);
    if (!conversation) throw new Error('message not found');
    if (conversation.status !== 'accepted') throw new Error('the request you sent must be accepted before you start this conversation');
    if (
        !conversation.requester.equals(currentUserId) &&
        !conversation.recipient.equals(currentUserId)
    ) {
        throw new Error('Unauthorized');
    }
    if (conversation.requester.equals(conversation.recipient)) {
        throw new Error('Cannot create a conversation with yourself');
    }
    const startConversation = await ConversationRepo.create({
        participants: [
            conversation.requester,
            conversation.recipient
        ],
        identityRequest: conversation._id
    });

    return { message: 'success', data: startConversation }
}







export const getConversation = async (identityRequestId, currentUserId) => {
    const user = await IdentityRepo.findById(identityRequestId);
    if (!user) throw new Error('message not found');
    if (user.status !== 'accepted') {
        throw new Error('Identity request must be accepted first');
    }
    if (
        !user.requester.equals(currentUserId) &&
        !user.recipient.equals(currentUserId)
    ) {
        throw new Error('Unauthorized');
    }
    const conversation = await ConversationRepo.findOne({
        identityRequest: identityRequestId
    });
    return {
        message: 'success',
        data: conversation
    }
}