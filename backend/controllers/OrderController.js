const sequelize = require("../config/database");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Item = require("../models/item");

const TAX_RATE = 0.05;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 40;

const normalizeText = (value) => String(value ?? "").trim();

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      payment_method = "COD",
      items,
    } = req.body;

    const customerFields = [
      ["first_name", first_name],
      ["last_name", last_name],
      ["email", email],
      ["phone", phone],
      ["address", address],
      ["city", city],
      ["state", state],
      ["pincode", pincode],
    ];

    const missing = customerFields
      .filter(([, value]) => !normalizeText(value))
      .map(([key]) => key);

    if (missing.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Please provide all required delivery details.",
        fields: missing,
      });
    }

    const cleanEmail = normalizeText(email).toLowerCase();
    const cleanPhone = normalizeText(phone);
    const cleanPincode = normalizeText(pincode);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!/^\d{10,15}$/.test(cleanPhone)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    if (!/^\d{6}$/.test(cleanPincode)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Please enter a valid 6-digit pincode.",
      });
    }

    if (payment_method !== "COD") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Only Cash on Delivery is currently available.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cart is empty.",
      });
    }

    const uniqueIds = new Set();
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const itemId = Number(cartItem.item_id);
      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(itemId) || itemId <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Invalid food item.",
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Invalid quantity.",
        });
      }

      if (uniqueIds.has(itemId)) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Duplicate food item in cart.",
        });
      }

      uniqueIds.add(itemId);

      const dbItem = await Item.findByPk(itemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!dbItem) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Food item #${itemId} no longer exists.`,
        });
      }

      const stock = Math.max(
        0,
        Number.parseInt(dbItem.stock_quantity, 10) || 0
      );

      if (stock < quantity) {
        await transaction.rollback();
        return res.status(409).json({
          message: `${dbItem.name} has only ${stock} item(s) available.`,
        });
      }

      const price = Number(dbItem.price);
      const itemTotal = Number(
        (price * quantity).toFixed(2)
      );

      subtotal += itemTotal;

      orderItems.push({
        dbItem,
        item_id: dbItem.id,
        item_name: dbItem.name,
        price,
        quantity,
        total: itemTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    const deliveryFee =
      subtotal <= 0 || subtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : DELIVERY_FEE;

    const tax = Number(
      (subtotal * TAX_RATE).toFixed(2)
    );

    const totalAmount = Number(
      (subtotal + deliveryFee + tax).toFixed(2)
    );

    const order = await Order.create(
      {
        first_name: normalizeText(first_name),
        last_name: normalizeText(last_name),
        email: cleanEmail,
        phone: cleanPhone,
        address: normalizeText(address),
        city: normalizeText(city),
        state: normalizeText(state),
        pincode: cleanPincode,
        payment_method: "COD",
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: "Pending",
      },
      { transaction }
    );

    for (const line of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          item_id: line.item_id,
          item_name: line.item_name,
          price: line.price,
          quantity: line.quantity,
          total: line.total,
        },
        { transaction }
      );

      const newStock =
        Number(line.dbItem.stock_quantity) -
        line.quantity;

      await line.dbItem.update(
        {
          stock_quantity: newStock,
          availability: newStock > 0,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: order.id,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total_amount: totalAmount,
        status: "Pending",
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Transaction already closed
    }

    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Error creating order.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

const getOrders = async (_req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Error fetching orders.",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(
      req.params.id,
      {
        include: [
          {
            model: OrderItem,
            as: "orderItems",
          },
        ],
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      message: "Error fetching order.",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const status = normalizeText(req.body.status);

    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
        allowedStatuses,
      });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    await order.update({ status });

    return res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Error updating order status.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};