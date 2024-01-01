const mongoose = require('mongoose')
const dotenv = require('dotenv')
const {ColorProduct, SizeProduct} = require('../../app/models/Product')
dotenv.config()
mongoose.set("strictQuery", false)

async function connect() {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL)
        // await ColorProduct.create({ name: 'xanh' });
        // await ColorProduct.create({ name: 'do' });
        // await ColorProduct.create({ name: 'tim' });
        // await ColorProduct.create({ name: 'vang' });
        // await SizeProduct.create({ name: 'S' });
        // await SizeProduct.create({ name: 'L' });
        // await SizeProduct.create({ name: 'M' });
        // await SizeProduct.create({ name: 'XL' });

        console.log("database connected")
    } catch (error) {
        console.log("connect fail");
        console.log(error)
    }
}

module.exports = { connect }