const mongoose = require("mongoose")
const deletePlugin = require('mongoose-delete');

const ordersSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Khách hàng'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ordersItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "VariantProduct"
            },
            quantity: { type: Number, default: 1 }
        }
    ],
    address: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    email: {
        type: String,
    },   
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    status: {
        type: Number,
        default: 0 // o la đang chờ, 1 la ....
    },

    totalPrice: {
        type: Number,
        require: true,
    },


}, {timestamps: true})

ordersSchema.plugin(deletePlugin, { overrideMethods: true, deletedAt: true,});

module.exports = mongoose.model("Orders", ordersSchema)