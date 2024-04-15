const router = require("express").Router()

const productController = require("../app/controllers/productController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")


router.post("/create",auth, authEmployee, productController.createProduct)
router.patch("/update/:id",auth, authEmployee, productController.updateProduct)

router.get("/getAllProduct", productController.getAllProduct)
router.get("/getProductById/:id",  productController.getProductByID)
router.get("/getProductByVariant/:id", productController.getProductByVariant)
router.get("/getProductBySubCategory/:id", productController.getProductBySubCategory)
router.get("/getProductByCategory/:id", productController.getProductByCategory)
router.post("/getProductBySku", productController.getDetailProductBySku)
router.get("/getProductByParentCategory/:id", productController.getProductByParentCategory)

router.get("/search", productController.searchProduct)
router.get("/getAllSize", productController.getAllSize)
router.get("/getAllColor", productController.getAllColor)

router.delete("/delete/:id",auth, authEmployee, productController.deleteOneProduct)
router.delete("/delete_selected/",auth, authEmployee, productController.deleteSelectedProduct)

router.get("/getLocation, productController.getLocation)



module.exports = router
