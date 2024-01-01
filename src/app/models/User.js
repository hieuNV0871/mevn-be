const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Vui lòng nhập tên của bạn"],
        minlength: 6,
        maxlength: 20,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Vui lòng nhập email của bạn"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Vui lòng nhập mật khẩu của bạn"],
        minlength: 6,
        unique: true
    },
    role: {
        type: Number,
        default: 0 // 0: normal user, 1: nhân viên, 9999: admin 
    },
    avatar: {
        src: {
            type: String,
            default: "https://th.bing.com/th/id/OIF.m5Go9dGcpHsOuJujFQbsJg?pid=ImgDet&rs=1"
        },
        id: {
            type: String
        }
    }

}, {timestamps: true})


module.exports = mongoose.model("User", userSchema)