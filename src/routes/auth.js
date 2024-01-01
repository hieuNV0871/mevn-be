const router = require("express").Router()

const authController = require("../app/controllers/authController")

const auth = require("../app/middleware/auth")

router.post("/signup", authController.signup)
router.post("/activation", authController.activeEmail)
router.post("/signin", authController.signin)
router.post("/refresh_token", authController.getAccessToken)
router.post("/forgot_password", authController.forgotPassword)
router.post("/reset_password", auth, authController.resetPassword)
router.post("/signout",auth, authController.signout)
router.post("/google_login", authController.googleLogin)
router.patch("/change_pass", auth, authController.changePass)


module.exports = router