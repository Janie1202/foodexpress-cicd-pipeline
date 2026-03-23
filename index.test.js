const request = require("supertest");
const app = require("./index");

// ─── Health Check ─────────────────────────────────────────────────────────────
describe("GET /", () => {
  it("should return service info and status running", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe("FoodExpress API");
    expect(res.body.status).toBe("running");
  });
});

// ─── Menu GET Tests ───────────────────────────────────────────────────────────
describe("GET /api/menu", () => {
  it("should return all menu items", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should filter menu items by category", async () => {
    const res = await request(app).get("/api/menu?category=Italian");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((item) => {
      expect(item.category).toBe("Italian");
    });
  });
});

describe("GET /api/menu/:id", () => {
  it("should return a single menu item", async () => {
    const res = await request(app).get("/api/menu/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it("should return 404 for non-existent menu item", async () => {
    const res = await request(app).get("/api/menu/9999");
    expect(res.statusCode).toBe(404);
  });
});

// ─── Menu POST Tests ──────────────────────────────────────────────────────────
describe("POST /api/menu", () => {
  it("should create a new menu item", async () => {
    const res = await request(app).post("/api/menu").send({
      name: "Tacos",
      category: "Mexican",
      price: 9.99,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Tacos");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/menu").send({ name: "Tacos" });
    expect(res.statusCode).toBe(400);
  });
});

// ─── Order Tests ──────────────────────────────────────────────────────────────
describe("GET /api/orders", () => {
  it("should return all orders", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/orders", () => {
  it("should create a new order", async () => {
    const res = await request(app).post("/api/orders").send({
      customerId: 103,
      items: [1, 2],
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe("pending");
  });

  it("should return 400 if items are missing", async () => {
    const res = await request(app).post("/api/orders").send({ customerId: 103 });
    expect(res.statusCode).toBe(400);
  });
});

// ─── PUT Tests ────────────────────────────────────────────────────────────────
describe("PUT /api/orders/:id/status", () => {
  it("should update order status", async () => {
    const res = await request(app)
      .put("/api/orders/1/status")
      .send({ status: "preparing" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("preparing");
  });

  it("should return 400 for invalid status", async () => {
    const res = await request(app)
      .put("/api/orders/1/status")
      .send({ status: "flying" });
    expect(res.statusCode).toBe(400);
  });
});

// ─── DELETE Tests ─────────────────────────────────────────────────────────────
describe("DELETE /api/menu/:id", () => {
  it("should delete a menu item", async () => {
    const res = await request(app).delete("/api/menu/4");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 404 for non-existent item", async () => {
    const res = await request(app).delete("/api/menu/9999");
    expect(res.statusCode).toBe(404);
  });
});
