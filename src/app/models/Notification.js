const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        require: true, 
    },
    title: {
        type: String,
        require: true,
    },
    content: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false
    },


}, {timestamps: true})


const userSocketIdSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    socketId: {
        type: Array,
        default: []
    }
}, {timestamps: true})



const Notification = mongoose.model("Notification", notificationSchema);
const UserSocketId = mongoose.model("UserSocketId", userSocketIdSchema);


module.exports = {
    UserSocketId,
    Notification
}
