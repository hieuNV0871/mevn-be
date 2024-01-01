const router = require("express").Router()

const notificationController = require("../app/controllers/notificationController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")




router.get("/get_all",auth, authEmployee, notificationController.getAll)
router.patch("/readNoti/:id",auth, authEmployee, notificationController.readNotification)


module.exports = router
