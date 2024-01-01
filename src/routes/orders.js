const router = require("express").Router()

const ordersController = require("../app/controllers/ordersController")
const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")

router.post("/create",  ordersController.createOrders)
router.get("/getAll", auth, authEmployee, ordersController.getAllOrders)
router.get("/getPersonalOrders",auth, ordersController.getPersonalOrders)
router.patch("/updatePersonalOrders/:id",auth, ordersController.updatePersonalOrders)
router.patch("/cancel/:id", auth, ordersController.cancellationOrders)
router.patch("/update_orders_status",auth, authEmployee,  ordersController.updateOrdersStatus) 
router.delete("/delete/:id", auth,authEmployee, ordersController.deleteOneOrders)


module.exports = router
