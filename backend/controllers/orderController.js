import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryLog from "../models/InventoryLog.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    let totalAmount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) throw new Error("Product not found");

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      totalAmount += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save({ session });

      // ✅ INVENTORY LOG (SALE)
      await InventoryLog.create(
        [
          {
            product: product._id,
            change: -item.quantity,
            type: "SALE",
          },
        ],
        { session }
      );

      item.price = product.price;
    }

    const order = await Order.create(
      [
        {
          items,
          totalAmount,
          createdBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

// GET ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("createdBy", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};