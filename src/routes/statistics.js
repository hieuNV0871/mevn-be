const router = require("express").Router()

const statisticsController = require("../app/controllers/statisticsController")

const auth = require("../app/middleware/auth")
const authAdmin = require("../app/middleware/authAdmin")




router.get("/revenue", auth, authAdmin, statisticsController.revenueStatistics)
router.get("/hotSellingProduct", auth, authAdmin, statisticsController.hotSellingProductStatistics)




module.exports = router
