const { getUsers, userExists, createNewUser, logIn } = require("./auth");

module.exports = function router(app) {
  // user authentication routes
  app.get("/", getUsers); // remove this route
  app.post("/signup", createNewUser);
  app.post("/login", logIn);
};
