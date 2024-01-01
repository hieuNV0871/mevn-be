const mongoose = require("mongoose")


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    // slug: {
    //     type: String,
    //     slug: 'name',
    //     unique: true
    // },
    position: {
        type: Number,
        default: 0
    }

}, {timestamps: true})


module.exports = mongoose.model("Category", categorySchema)