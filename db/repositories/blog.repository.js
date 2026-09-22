export class BlogRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findOne(data, select) {
        return this.model.findOne(data).select(select);
    }
    async findAll(data) {
        return this.model.find(data);
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async findByIdAndUpdate(id, data) {
        return this.model.findByIdAndUpdate(id, data);
    }
    async findByIdAndDelete(id) {
        return this.model.findByIdAndDelete(id);
    }
}