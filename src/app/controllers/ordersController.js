const Orders = require("../models/Orders");
const Cart = require("../models/Cart");
const User = require("../models/User");
const {createNotification} = require("./notificationController")

const { VariantProduct } = require("../models/Product");
const ordersController = {
  createOrders: async (req, res) => {
    try {
      const {
        ordersItems,
        name,
        user,
        address,
        phone,
        status,
        paymentMethod,
        totalPrice,
      } = req.body;

      if (ordersItems.length < 1)
        return res.status(400).json({ error: "Giỏ hàng của bạn đang trống" });

      if (!address)
        return res
          .status(400)
          .json({ error: "Vui lòng cập nhật địa chỉ giao hàng" });

      const newOrders = new Orders({
        user,
        name,
        ordersItems,
        address,
        phone,
        status: status ? status : 0,
        paymentMethod,
        totalPrice,
      });
      if(user !== null) {

        const cartPrice = await Cart.findOne({ user }).populate(
          "cartItems.product",
          "price"
        );
        const cartTotalPrice = cartPrice.cartItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
  
        // if (totalPrice !== cartTotalPrice) {
        //   return res
        //     .status(400)
        //     .json({ error: "Tổng giá trị đơn hàng không khớp với giỏ hàng" });
        // }
        const itemsExistInCart = ordersItems.every((item) => {
          const foundCartItem = cartPrice.cartItems.find(
            (cartItem) => cartItem.product._id.toString() === item.product
          );
          return foundCartItem && foundCartItem.quantity >= item.quantity;
        });
  
        if (!itemsExistInCart) {
          return res
            .status(400)
            .json({ error: "Một số sản phẩm không tồn tại trong giỏ hàng hoặc số lượng không đủ" });
        }
        await Cart.findOneAndUpdate(
          { user },
          {
            $pull: {
              cartItems: {
                variant: { $in: ordersItems.map((item) => item.variant) },
              },
            },
          }
        );
      }

      for (const item of ordersItems) {
        const variant = await VariantProduct.findById(item.variant);
        if (variant && variant.quantity >= item.quantity) {
          variant.quantity -= item.quantity;
          await variant.save();
        }

        else {
          return res
            .status(400)
            .json({ error: "Một số sản phẩm không tồn tại trong giỏ hàng hoặc số lượng không đủ" });
        }
      }
      await newOrders.save();
      const notification = {
        userId: user,
        type: "Order",
        title: getRandomTitle(),
        content: "Có một đơn hàng mới được tạo, vui lòng kiểm tra"
      }
      console.log(notification.title);
     await createNotification(notification.userId, notification.type, notification.title, notification.content)
      _io.emit('sendNotiToAdmin',  "new-order")
      res
        .status(200)
        .json({ success: "Tạo đơn hàng thành công", data: newOrders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateOrdersStatus: async (req, res) => {
    try {
      const { orderId, status } = req.body;
      const existingOrder = await Orders.findById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ error: "Đơn hàng không tồn tại" });
      }
      if(status === -1)
      for (const item of existingOrder.ordersItems) {
        const variant = await VariantProduct.findById(item.variant);
        if (variant) {
          variant.quantity += item.quantity;
          await variant.save();
        }
      }
      existingOrder.status = status;
      await existingOrder.save();
      res
        .status(200)
        .json({
          success: "Cập nhật trạng thái đơn hàng thành công",
          data: existingOrder,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // admin
  //    de day mai lam tiep ^^
  updatePersonalOrders: async (req, res) => {
    try {
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteOneOrders: async (req, res) => {
    try {
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPersonalOrders: async (req, res) => {
    try {
      const user = req.user.id;
      
      const Orderss = await Orders.find({ user, status: { $ne: 999 } })
        .populate({
          path: "ordersItems.product",
          model: "Product",
        })
        .populate({
          path: "ordersItems.variant",
          model: "VariantProduct",
          populate: {
            path: "colorId",
            model: "ColorProduct",
          },
        })
        .populate({
          path: "ordersItems.variant",
          model: "VariantProduct",
          populate: {
            path: "sizeId",
            model: "SizeProduct",
          },
        });
      res
        .status(200)
        .json({ success: "Lấy toàn bộ đơn hàng thành công", data: Orderss });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAllOrders: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
      const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
      const skip = (page - 1) * limit;
      const totalOrders = await Orders.countDocuments();
      const Orderss = await Orders.find()
        .populate({
          path: "ordersItems.product",
          model: "Product",
        })
        .populate({
          path: "ordersItems.variant",
          model: "VariantProduct",
          populate: {
            path: "colorId",
            model: "ColorProduct",
          },
        })
        .populate({
          path: "ordersItems.variant",
          model: "VariantProduct",
          populate: {
            path: "sizeId",
            model: "SizeProduct",
          },
        }).skip(skip).limit(limit);
      res
        .status(200)
        .json({ success: "Lấy toàn bộ hoa don thành công", data: Orderss , total:totalOrders});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  cancellationOrders: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      // const { status } = req.body;
      const _id = req.params.id;
  

  
      if (!user) {
        return res.status(400).json({ error: "Người dùng không tồn tại" });
      }
  
      const order = await Orders.findById(_id);
  
      if (!order) {
        return res.status(404).json({ error: "Đơn hàng không tồn tại" });
      }

      if (order.status !== 0) {
        return res.status(400).json({ error: "Vui lòng liên hệ người bán" });
      }
  
      if (order.status === -1) {
        return res.status(400).json({ error: "Đơn hàng đã bị hủy trước đó" });
      }
  
      // Trả lại số lượng sản phẩm trong variant
      for (const item of order.ordersItems) {
        const variant = await VariantProduct.findById(item.variant);
        if (variant) {
          variant.quantity += item.quantity;
          await variant.save();
        }
      }
  
      order.status = -1;
      await order.save();
  
      return res.status(200).json({ success: "Hủy đơn hàng thành công", data: order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
const getRandomTitle = () => {
  
  const title = Math.floor(Math.random() * 10) + 1 < 5
    ? "Có khách đặt hàng, xem ngay"
    : "Đơn hàng mới đã được tạo, hãy kiểm tra ngay";

  return title;
};

module.exports = ordersController;
