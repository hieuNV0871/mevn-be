const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    sku: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        default: null
    },
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        default: null
    },
    price: {
        type: Number,
        required: true,
    },
    images: [
        {
          src: {
            type: String,
            // required: true
          },
          id: {
            type: String,
            // required: true
          }
        }
      ]

}, {timestamps: true})


const colorProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
}, {timestamps: true})

const sizeProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
}, {timestamps: true})


const variantProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SizeProduct',
        default: null
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ColorProduct',
        default: null
    },
    quantity: {
        type: Number,
        require: true
    },
    sku: {
        type: String,
        unique: true
    }
}, {timestamps: true})


const Product = mongoose.model("Product", productSchema);
const ColorProduct = mongoose.model("ColorProduct", colorProductSchema);
const SizeProduct = mongoose.model("SizeProduct", sizeProductSchema);
const VariantProduct = mongoose.model("VariantProduct", variantProductSchema);

module.exports = {
    Product,
    ColorProduct,
    SizeProduct,
    VariantProduct,
}
