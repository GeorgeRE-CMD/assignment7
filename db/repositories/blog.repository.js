export class BlogRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async updateOne(filters, data, options) {
        return this.model.updateOne(filters, data, options)
    }
    async findOne(data, select) {
        return this.model.findOne(data).select(select);
    }
    async findById(data) {
        return await this.model.findById(data);
    }
    async findAll(filters = {}, projection = null, options = {}) {
        return this.model.find(filters, projection, options);
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
    async updateStatus(filter, status) {
        return await this.model.findOneAndUpdate(
            filter,
            { status },
            {
                new: true,
                runValidators: true
            }
        );
    }
}