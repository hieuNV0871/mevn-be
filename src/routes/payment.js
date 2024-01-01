const router = require("express").Router()

const paymentController = require("../app/controllers/paymentController")
const auth = require("../app/middleware/auth")

router.post("/momo", auth, paymentController.paymentWithMoMo)
router.post("/zalo", auth, paymentController.paymentWithZALO)

router.post("/create_payment_url", auth, paymentController.createPaymentUrl)
router.get("/vnpay_return", auth, paymentController.getVnpayReturn)
router.get("/vnpay_ipn", auth, paymentController.getVnpayIPN)

module.exports = router
