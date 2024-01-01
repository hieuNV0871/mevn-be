const router = require("express").Router()

const brandController = require("../app/controllers/brandController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")


router.post("/create", auth, authEmployee, brandController.createBrand)

router.get("/get_all", brandController.getAllBrand)

router.patch("/update/:id", auth, authEmployee,  brandController.updateBrand)

router.delete("/delete/:id", auth, authEmployee,  brandController.deleteOneBrand)

module.exports = router
