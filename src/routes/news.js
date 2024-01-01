const router = require("express").Router()

const newsController = require("../app/controllers/newsController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")


router.post("/create",auth, authEmployee,  newsController.createNews)

router.get("/get_all",auth, authEmployee, newsController.getAllNews)
router.get("/get_all_published", newsController.getAllNewsPublished)


router.patch("/update/:id", auth, authEmployee, newsController.updateNews)

router.delete("/delete/:id", auth, authEmployee, newsController.deleteOneNews)

module.exports = router
