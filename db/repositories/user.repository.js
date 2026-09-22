import User from "../models/user.model.js";
import { BlogRepository } from "./blog.repository.js";

export class UserRepository extends BlogRepository{
    constructor(){
        super(User)
    }
}

export const userRepository = new UserRepository