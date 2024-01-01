const router = require("express").Router()

const categoryController = require("../app/controllers/categoryController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")


router.post("/create", auth, authEmployee, categoryController.createCategory)

router.get("/get_all_parent", categoryController.getAllParentCategory)
router.get("/get_category_by_id/:id", categoryController.getCategoryById)
router.get("/get_sub_category_by_parent/:id", categoryController.getAllSubCategoryByParent)

router.patch("/update/:id", auth, authEmployee, categoryController.updateCategory)

router.delete("/delete/:id", auth, authEmployee, categoryController.deleteOneCategory)







module.exports = router
