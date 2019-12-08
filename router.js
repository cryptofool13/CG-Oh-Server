const jwt = require("jsonwebtoken");

const { auth, inventory } = require("./controllers");

module.exports = function router(app) {
  // user authentication routes

  app.get("/", auth.getUsers); // remove this route
  app.post("/signup", auth.createNewUser);
  app.post("/login", auth.logIn);

  // scanner routes

  app.use(function(req, res, next) {
    // check if user has valid token
    if (!req.headers.authorization) {
      return res.status(403).json({ error: "No credentials sent!" });
    }
    next();
  });

  app.get("/inventory/:upc", inventory.getItem);

  // manager routes

  app.use(function(req, res, next) {
    // check if user has a valid token
    // and if user is Admin or Manager
    let token = req.headers.authorization;
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    let { role } = decoded;
    if (Date.now() >= decoded.exp * 1000) {
      return res
        .status(401)
        .json({ error: "expired token, please log in again" });
    }
    if (role !== "admin" && role !== "manager") {
      return res.status(401).json({ error: "unauthorized credentials", role });
    }
    next();
  });

  app.get("/inventory", inventory.getAllItems);

  // admin routes

  app.use(function(req, res, next) {
    // check if user has a valid token
    // and if user is Admin
    let token = req.headers.authorization;
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    let { role } = decoded;
    if (Date.now() >= decoded.exp * 1000) {
      return res
        .status(401)
        .json({ error: "expired token, please log in again" });
    }
    if (role !== "admin") {
      return res.status(401).json({ error: "unauthorized credentials", role });
    }
    next();
  });

  app.post("/inventory/add-item", inventory.addItem);
};
