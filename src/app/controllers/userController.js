
const Users = require("../models/User")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt");
const User = require("../models/User");
dotenv.config()

const userController = {

  createUser: async (req, res) => {
    try {
      const {username, email, password} = req.body
      if(!username || ! email || !password) return res.status(400).json({msg: "Hãy nhập tất cả các hàng"})
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)
      const newUser = new User({
          username,
          email,
          password: passwordHash
      })
      await newUser.save()
      res.status(200).json("test")
  } catch (error) {
      res.status(500).json({msg: error.message})
  }
  },
  getUserInfo: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");

      res
        .status(200)
        .json({ success: "Lấy thông tin người dùng thành công", data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllUser: async (req, res) => {

    try {
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
            const totalUsers = await Users.countDocuments();
      const users = await Users.find().select("-password").skip(skip).limit(limit);
      res
        .status(200)
        .json({
          success: "Lấy thông tin tất cả người dùng thành công",
          data: users, total: totalUsers
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username, avatar } = req.body;
      console.log(req.user);
      await Users.findOneAndUpdate({ _id: req.user.id }, { username, avatar });
      res
        .status(200)
        .json({ success: "Cập nhật thông tin người dùng thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUserPermission: async (req, res) => {
    try {
      const { role } = req.body;
      // 9999: admin, 1: employee, 0: nor
      await Users.findOneAndUpdate({ _id: req.params.id }, { role });
      res.status(200).json({ success: "Cập nhật quyền người dùng thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  

  deleteUser: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: "Xóa tài khoản người dùng thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

};

module.exports = userController