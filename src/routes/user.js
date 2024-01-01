const userController = require("../app/controllers/userController")
const router = require("express").Router()
const auth = require("../app/middleware/auth")
const authAdmin = require("../app/middleware/authAdmin")


router.get("/info", auth, userController.getUserInfo)
router.get("/all_user",auth, authAdmin, userController.getAllUser)

router.post("/create",auth, authAdmin, userController.createUser)
router.patch("/update",auth, userController.updateUser)
router.patch("/update_permission/:id",auth, authAdmin, userController.updateUserPermission)


router.delete("/delete/:id", auth,authAdmin, userController.deleteUser)





module.exports = router