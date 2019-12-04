const { auth, inventory } = require("./controllers");

module.exports = function router(app) {
  // user authentication routes
  app.get("/", auth.getUsers); // remove this route
  app.post("/signup", auth.createNewUser);
  app.post("/login", auth.logIn);
  // scanner routes
  app.get('/inventory/:upc', inventory.getItem)
  // admin routes
  app.get('/inventory', inventory.getAllItems)
  app.post('/inventory/add-item', inventory.addItem)
};
