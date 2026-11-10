import { conversation } from "../../moduels/messages/message.service.js";
import { BlogRepository } from "./blog.repository.js";

export class ConversationRepo extends BlogRepository {
    constructor() {
        super(conversation)
    }
}