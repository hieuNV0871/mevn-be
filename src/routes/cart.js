const cartController = require("../app/controllers/cartController")
const router = require("express").Router()
const auth = require("../app/middleware/auth")


router.post("/add_to_cart", auth, cartController.addToCart)

router.patch("/update_cart_item", auth, cartController.updateCartItem)

router.delete("/delete_from_cart/:id", auth , cartController.deleteCartItem)

router.get("/get_cart_item", auth, cartController.getCartItem)




module.exports = router