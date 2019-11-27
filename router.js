const { auth } = require("./controllers");

module.exports = function router(app) {
  // user authentication routes
  app.get("/", auth.getUsers); // remove this route
  app.post("/signup", auth.createNewUser);
  app.post("/login", auth.logIn);
};
