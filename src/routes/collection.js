const router = require("express").Router()

const collectionController = require("../app/controllers/collectionController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")


router.post("/create", auth, authEmployee, collectionController.createCollection)

router.get("/get_all", collectionController.getAllCollection)
router.get("/get_collection_by_id/:id", collectionController.getCollectionById)

router.patch("/update/:id", auth, authEmployee, collectionController.updateCollection)

router.delete("/delete/:id", auth, authEmployee, collectionController.deleteOneCollection)


module.exports = router
