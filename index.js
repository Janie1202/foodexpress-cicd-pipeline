const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── In-memory data store ────────────────────────────────────────────────────
let menuItems = [
  { id: 1, name: "Burger", category: "Fast Food", price: 8.99, available: true },
  { id: 2, name: "Pizza", category: "Italian", price: 12.99, available: true },
  { id: 3, name: "Sushi", category: "Japanese", price: 15.99, available: true },
  { id: 4, name: "Pasta", category: "Italian", price: 10.99, available: false },
];

let orders = [
  { id: 1, customerId: 101, items: [1, 2], status: "delivered", total: 21.98 },
  { id: 2, customerId: 102, items: [3], status: "pending", total: 15.99 },
];

let nextMenuId = 5;
let nextOrderId = 3;

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    service: "FoodExpress API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// GET all menu items
app.get("/api/menu", (req, res) => {
  const { category, available } = req.query;
  let result = [...menuItems];

  if (category) {
    result = result.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (available !== undefined) {
    result = result.filter((item) => item.available === (available === "true"));
  }

  res.json({ success: true, count: result.length, data: result });
});

// GET single menu item by ID
app.get("/api/menu/:id", (req, res) => {
  const item = menuItems.find((m) => m.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ success: false, message: "Menu item not found" });
  }
  res.json({ success: true, data: item });
});

// GET all orders
app.get("/api/orders", (req, res) => {
  const { status } = req.query;
  let result = [...orders];

  if (status) {
    result = result.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  res.json({ success: true, count: result.length, data: result });
});

// GET single order by ID
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  res.json({ success: true, data: order });
});


// POST create a new menu item
app.post("/api/menu", (req, res) => {
  const { name, category, price, available = true } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "name, category, and price are required",
    });
  }

  const newItem = { id: nextMenuId++, name, category, price, available };
  menuItems.push(newItem);
  res.status(201).json({ success: true, message: "Menu item created", data: newItem });
});

// POST create a new order
app.post("/api/orders", (req, res) => {
  const { customerId, items } = req.body;

  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "customerId and a non-empty items array are required",
    });
  }

  const orderedItems = items.map((id) => menuItems.find((m) => m.id === id)).filter(Boolean);
  const total = orderedItems.reduce((sum, item) => sum + item.price, 0);

  const newOrder = {
    id: nextOrderId++,
    customerId,
    items,
    status: "pending",
    total: parseFloat(total.toFixed(2)),
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, message: "Order placed", data: newOrder });
});

// PUT update a menu item
app.put("/api/menu/:id", (req, res) => {
  const index = menuItems.findIndex((m) => m.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Menu item not found" });
  }

  menuItems[index] = { ...menuItems[index], ...req.body, id: menuItems[index].id };
  res.json({ success: true, message: "Menu item updated", data: menuItems[index] });
});

// PUT update order status
app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered", "cancelled"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  const index = orders.findIndex((o) => o.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  orders[index].status = status;
  res.json({ success: true, message: "Order status updated", data: orders[index] });
});

// DELETE a menu item
app.delete("/api/menu/:id", (req, res) => {
  const index = menuItems.findIndex((m) => m.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Menu item not found" });
  }

  const deleted = menuItems.splice(index, 1)[0];
  res.json({ success: true, message: "Menu item deleted", data: deleted });
});

// DELETE an order
app.delete("/api/orders/:id", (req, res) => {
  const index = orders.findIndex((o) => o.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const deleted = orders.splice(index, 1)[0];
  res.json({ success: true, message: "Order deleted", data: deleted });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FoodExpress API running on port ${PORT}`);
    console.log("AUPP v2");
  });
}

module.exports = app;
