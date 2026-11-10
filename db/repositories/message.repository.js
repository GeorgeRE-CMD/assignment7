import { Messages } from "../models/message.model.js";
import { BlogRepository } from "./blog.repository.js";

export class MessageRepo extends BlogRepository {
    constructor() {
        super(Messages);
    }
}