import { Router } from "express";
import { multerUpload } from "../../middlewares/multer.middleware.js";
import { createConversation, getConversation, getMessagesByRecieverId, reject, sendMessage } from "./message.service.js";
import { recieverIdValidation } from "../../utils/security/zod.js";
import { validation } from "../../middlewares/zod.middleware.js";
import { authenticate } from "../../middlewares/token.middleware.js";

const messageRouter = Router();
messageRouter.post('/send-message', authenticate, multerUpload({ desiredPath: 'messages' }).single('file'), validation(recieverIdValidation), async (req, res) => {
    const { content, receiverId } = req.validate
    const file = req.file;
    if (!content && !file) throw new Error('cannot send an empty message');
    const result = await sendMessage({ content, file, receiverId, senderId: req.user._id });
    res.status(201).json({
        message: 'Message sent successfully',
        data: {
            _id: result._id,
            content: result.content,
            file: result.file,
            receiverId: result.receiverId
        }
    });
})

messageRouter.get('/get-messages', authenticate, async (req, res) => {
    const result = await getMessagesByRecieverId(req.user);
    res.status(200).json({ message: 'success', data: result })
})

messageRouter.patch(
    '/identity-request/:identityRequestId/accept',
    authenticate,
    (async (req, res) => {
        const { identityRequestId } = req.params;

        const result = await accept(
            identityRequestId,
            req.user._id
        );

        return res.status(200).json({
            message: 'Identity request accepted successfully',
            data: result
        });
    })
);

messageRouter.patch(
    '/identity-request/:identityRequestId/reject',
    authenticate,
    (async (req, res) => {
        const { identityRequestId } = req.params;

        const result = await reject(
            identityRequestId,
            req.user._id
        );

        return res.status(200).json({
            message: 'Identity request rejected successfully',
            data: result
        });
    })
);

messageRouter.get('/get-conversation/:identityRequestId', authenticate, async (req, res) => {
    const result = await getConversation(req.params.identityRequestId, req.user._id);
    res.status(200).json({ message: 'conversation retrieved successfully', data: result })
})

messageRouter.post('/create-conversation/:identityRequestId', authenticate, async (req, res) => {
    const result = await createConversation(req.params.identityRequestId, req.user._id);
    res.status(201).json({
        message: 'Conversation created successfully',
        data: result
    });
})
export default messageRouter;