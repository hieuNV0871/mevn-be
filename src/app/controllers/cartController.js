const User = require("../models/User");
const Cart = require("../models/Cart");
const {VariantProduct} = require('../models/Product')
const dotenv = require("dotenv");
dotenv.config();

const cartController = {
  addToCart: async (req, res) => {
    // try {
    //   const currentUser = await User.findById(req.user.id);
    //   const { user, cartItems } = req.body;
    //   if (!currentUser || user != currentUser._id) {
    //     return res.status(404).json({ error: "Tài khoản không tồn tại" });
    //   }
    //   let cart = await Cart.findOne({ user });
    //   if (!cart) {
    //     cart = new Cart({ user, cartItems: [] });
    //     await cart.save();
    //   }
    //   for (const newItem of cartItems) {
    //     const existingCartItemIndex = cart.cartItems.findIndex(
    //       (item) =>
    //         item.product == newItem.product && item.variant == newItem.variant
    //     );

    //     if (existingCartItemIndex !== -1) {
    //       cart.cartItems[existingCartItemIndex].quantity += newItem.quantity;
    //     } else {
    //       cart.cartItems.push(newItem);
    //     }
    //   }
    //   await cart.save();
    //   res.status(200).json({
    //     success: "Thêm sản phẩm vào giỏ hàng thành công",
    //     data: cart.cartItems,
    //   });
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }

    try {
      const currentUser = await User.findById(req.user.id);
      const { user, cartItems } = req.body;

      if (!currentUser || user != currentUser._id) {
          return res.status(404).json({ error: "Tài khoản không tồn tại" });
      }

      let cart = await Cart.findOne({ user });

      if (!cart) {
          cart = new Cart({ user, cartItems: [] });
          await cart.save();
      }

      // Lặp qua từng sản phẩm trong cartItems để kiểm tra số lượng
      for (const newItem of cartItems) {
          const existingCartItemIndex = cart.cartItems.findIndex(
              (item) => item.product == newItem.product && item.variant == newItem.variant
          );

          // Nếu sản phẩm đã tồn tại trong giỏ hàng
          if (existingCartItemIndex !== -1) {
              const variant = await VariantProduct.findById(newItem.variant);

              // Kiểm tra số lượng yêu cầu có lớn hơn số lượng có sẵn không
              if (variant && (newItem.quantity + cart.cartItems[existingCartItemIndex].quantity) > variant.quantity) {
                  return res.status(400).json({ error: `Số lượng yêu cầu lớn hơn số lượng có sẵn cho sản phẩm ` });
              }

              // Nếu số lượng yêu cầu hợp lệ, cập nhật giỏ hàng
              cart.cartItems[existingCartItemIndex].quantity += newItem.quantity;
          } else {
              // Nếu sản phẩm chưa tồn tại trong giỏ hàng, kiểm tra số lượng có sẵn
              const variant = await VariantProduct.findById(newItem.variant);

              if (variant && newItem.quantity > variant.quantity) {
                  return res.status(400).json({ error: `Số lượng yêu cầu lớn hơn số lượng có sẵn cho sản phẩm ` });
              }

              // Nếu số lượng yêu cầu hợp lệ, thêm sản phẩm vào giỏ hàng
              cart.cartItems.push(newItem);
          }
      }

      await cart.save();

      res.status(200).json({
          success: "Thêm sản phẩm vào giỏ hàng thành công",
          data: cart.cartItems,
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  },
  updateCartItem: async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id);
      const { user, cartItems } = req.body;
      if (!currentUser || user != currentUser._id) {
        return res.status(404).json({ error: "Tài khoản không tồn tại" });
      }
      let cart = await Cart.findOne({ user });
      if (!cart) {
        cart = new Cart({ user, cartItems: [] });
        await cart.save();
      }
      for (const newItem of cartItems) {
        const existingCartItemIndex = cart.cartItems.findIndex(
          (item) => item.product == newItem.product
        );

        if (existingCartItemIndex !== -1) {
          if (
            cart.cartItems[existingCartItemIndex].variant !== newItem.variant
          ) {
            // cart.cartItems[existingCartItemIndex].quantity += newItem.quantity;
            cart.cartItems[existingCartItemIndex].quantity = newItem.quantity;
            cart.cartItems[existingCartItemIndex].variant = newItem.variant;
          }
        }
      }
      await cart.save();
      res.status(200).json({
        success: "Thêm sản phẩm vào giỏ hàng thành công",
        data: cart.cartItems,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemId = req.params.id;
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
      }
      const updatedCartItems = cart.cartItems.filter(
        (item) => item._id != cartItemId
      );
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { cartItems: updatedCartItems } },
        { new: true } 
      );

      res
        .status(200)
        .json({
          success: "Xóa sản phẩm khỏi giỏ hàng thành công",
          data: updatedCartItems,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCartItem: async (req, res) => {
    try {
      const id = req.user.id;
      const item = await Cart.findOne({ user: id })
        .populate({
          path: "cartItems.variant",
          model: "VariantProduct",
          populate: {
            path: "productId",
            model: "Product"
          }
        })
        .populate({
          path: "cartItems.variant",
          model: "VariantProduct",
          populate: {
            path: "colorId",
            model: "ColorProduct",
          },
        })
        .populate({
          path: "cartItems.variant",
          model: "VariantProduct",
          populate: {
            path: "sizeId",
            model: "SizeProduct",
          },
        });
      res.status(200).json({ success: "Lấy giỏ hàng thành công", data: item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = cartController;
