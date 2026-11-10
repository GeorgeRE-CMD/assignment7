import { Identity } from "../models/IdentityRequest.model.js"
import { BlogRepository } from "./blog.repository.js"

export class IdentityRepo extends BlogRepository {
    constructor() {
        super(Identity)
    }
}