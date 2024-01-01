const Users = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../../utils/sendMail")
const {google} = require("googleapis")
const {OAuth2} = google.auth
const dotenv = require("dotenv")
dotenv.config()

const {CLIENT_URL} = process.env
const client = new OAuth2(process.env.MAIL_SERVICE_CLIENT_ID)
const authController = {
    signup: async (req, res)=>{
        try {
            const {username, email, password} = req.body
            const existingUser = await Users.findOne({ $or: [{ username }, { email }] });

                if (existingUser) {
                // If the user or email already exists, return an error
                return res.status(400).json({ msg: "Tài khoản hoặc email đã được sử dụng" });
                }
            if(!username || ! email || !password) return res.status(400).json({msg: "Hãy nhập tất cả các hàng"})
            if(!validateEmail(email)) return res.status(400).json({msg: "Sai định dạng email"})
            
            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(password, salt)
            
            const newUser = {
                username,
                email,
                password: passwordHash
            }
            const activation_token = createActiveToken(newUser)
            const url = `${CLIENT_URL}/auth/activeEmail/${activation_token}`
            const btnTitle = "click here to active"
            sendMail(email, url, btnTitle)
            res.status(200).json("test")
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },
    changePass: async (req, res) => {
        try {
          const id = req.user.id;
          const { oldPassword, password, cfPassword } = req.body;
      
          if (!oldPassword || !password || !cfPassword) {
            return res.status(400).json({ msg: "Hãy nhập tất cả các hàng" });
          }
      
          if (password !== cfPassword) {
            return res
              .status(400)
              .json({ msg: "Mật khẩu xác nhận không chính xác" });
          }
      
          const user = await Users.findById(id);
      
          if (!user) {
            return res.status(404).json({ msg: "Người dùng không tồn tại" });
          }
      
          const isMatch = await bcrypt.compare(oldPassword, user.password);
      
          if (!isMatch) {
            return res.status(401).json({ msg: "Mật khẩu hiện tại không chính xác" });
          }
      
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password, salt);
      
          await Users.findByIdAndUpdate(id, { password: passwordHash });
      
          res.status(200).json({ success: "Thay đổi mật khẩu thành công" });
        } catch (error) {
          res.status(500).json({ msg: error.message });
        }
      },
    activeEmail: async (req, res) => {
        try {
            const {activation_token} = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVE_TOKEN)

            const {username, email, password} = user

            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg: "email đã được sử dụng trước đó"})

            const newUser = new Users({
                username, email, password
            })
            await newUser.save()

            res.status(200).json({msg: "kích hoạt thành công, bạn có thể đăng nhập"})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    signin: async (req, res) => {
        try {
            // const {username} = req.body
            const {username} = req.body;
            const user = await Users.findOne({ $or: [{username}, {email: username}] });
            if(!user){
                return res.status(400).json({msg: "Tài khoản hoặc mật khẩu không chính xác"})
            }
            const isMatch = await bcrypt.compare(req.body.password, user.password)
            if(!isMatch) {
                return res.status(400).json({msg: "Tài khoản hoặc mật khẩu không chính xác"})
            }
            const refreshToken = createRefreshToken({id: user._id})
            
            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/',
                // secure: false,
                secure: true,
                sameSite: 'None',
                maxAge: 7*24*60*60*1000
            })
            
            const { password, ...others } = user._doc;
            
            res.json({user: others, refreshToken})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },
    
    getAccessToken: async (req, res) => {
        try {         
            const refreshToken = req.cookies.refreshtoken
            if(!refreshToken) return res.status(400).json({msg: "Không có token"})
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
                if(err) return res.status(400).json({msg: "Token không chính xác"})
                const accessToken = createAccessToken({id: user.id})
                res.json({accessToken})
            })
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "Tài khoản email chưa tạo"})
            const reset_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/auth/reset_password/${reset_token}`
            sendMail(email, url, "Đặt lại mật khẩu")
            res.json({msg: "Đã gửi liên kết để đặt lại mật khẩu, hãy kiểm tra email của bạn"})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(password, salt)
            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Cập nhật mật khẩu thành công"})
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    signout: async (req, res) => {
        try {
            res.clearCookie("refreshtoken")
            res.json("Đăng xuất thành công")
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    googleLogin: async (req, res) => {
        try {
            const { tokenId } = req.body;
            const verify = await client.verifyIdToken({idToken: tokenId, audience: process.env.MAIL_SERVICE_CLIENT_ID});
            const { email, name, picture, email_verified } = verify.payload;
            const randomPassword = email + picture;
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            if (!email_verified) return res.status(400).json({msg: "Email chưa được xác thực."});
        
            let user = await Users.findOne({ email });
            if (!user) {
                const newUser = new Users({
                    username: name,
                    email,
                    password: passwordHash,
                    avatar: { src: picture }
                });
                user = await newUser.save();
            } else {
                const isMatch = await bcrypt.compare(randomPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({msg: "Email đã được sử dụng để đăng kí tài khoản."});
                }
            }
        
            const refreshToken = createRefreshToken({id: user._id});
            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/',
                // secure: false,
                secure: true,
                sameSite: 'None',
                maxAge: 7*24*60*60*1000
            });
            const userGG = user._doc;
            res.json({ userGG, refreshToken });
        } catch (error) {
            res.status(500).json({msg: error.message});
        }
    }
}


const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
}
const createActiveToken = payload => {
    return jwt.sign(payload, process.env.ACTIVE_TOKEN, {expiresIn: "15m"})
}
const createAccessToken = payload => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: "5m"})
}
const createRefreshToken = payload => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn: "15d"})
}


module.exports = authController