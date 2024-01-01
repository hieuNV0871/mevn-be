const router = require("express").Router()

const uploadController = require("../app/controllers/uploadController")

const auth = require("../app/middleware/auth")
const authEmployee = require("../app/middleware/authEmployee")
const upload = require("../app/middleware/multer")

router.post("/upload_images", auth, upload.array('images', 5), uploadController.uploadImages)
router.post("/upload_avatar", auth, upload.single('image'), uploadController.uploadImage)


module.exports = router