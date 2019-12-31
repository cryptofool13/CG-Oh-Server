const jwt = require("jsonwebtoken")

const { auth, inventory, purchase } = require("./controllers")
const { isValidUpc } = require("./helpers/util")

module.exports = function router(app) {
	// user authentication routes

	app.get("/auth", auth.getUsers) // remove this route
	app.post("/auth/signup", auth.createNewUser)
	app.post("/auth/login", auth.logIn)

	// scanner routes
	app.use(function(req, res, next) {
		// check if user has valid token
		if (!req.headers.authorization) {
			return res.status(403).json({ error: "No credentials sent!" })
		}
		let token = req.headers.authorization
		let decoded = jwt.decode(token, process.env.JWT_SECRET)
		if (Date.now() >= decoded.exp * 1000) {
			return res
				.status(401)
				.json({ error: "expired token, please log in again" })
		}

		next()
	})

	// POS routes
	app.post("/purchase", purchase.purchaseItems)

	app.use(function(req, res, next) {
		// if upc is on req.body, check if it is valid
		if (!req.body && !req.params) {
			next()
		}
		if (req.body.upc) {
			if (!isValidUpc(req.body.upc)) {
				return res.status(422).send({ message: "invalid upc" })
			}
		}
		next()
	})

	app.use(function(req, res, next) {
		if (req.params.upc) {
			if (!isValidUpc(req.params.upc)) {
				console.log(req.params)
				return res.status(422).send({ message: "invalid upc" })
			}
		}
		next()
	})

	app.post("/inventory/:upc/update", inventory.updateInventory)
	app.get("/inventory/:upc", inventory.getItem)

	// TODO: add POS routes to manage transactions

	// manager routes

	app.use(function(req, res, next) {
		// check if user has a valid token
		// and if user is Admin or Manager
		let token = req.headers.authorization
		let decoded = jwt.verify(token, process.env.JWT_SECRET)
		let { role } = decoded
		if (role !== "admin" && role !== "manager") {
			return res.status(401).json({ error: "unauthorized credentials", role })
		}
		next()
	})

	app.get("/inventory", inventory.getAllItems)

	// admin routes

	app.use(function(req, res, next) {
		// check if user has a valid token
		// and if user is Admin
		let token = req.headers.authorization
		let decoded = jwt.verify(token, process.env.JWT_SECRET)
		let { role } = decoded
		if (role !== "admin") {
			return res.status(401).json({ error: "unauthorized credentials", role })
		}
		next()
	})
	app.delete('/auth/delete', auth.deleteUser)
	app.post("/inventory/:upc/price", inventory.setPrice)
	app.post("/inventory/add-item", inventory.addItem)
	app.post("/inventory/:upc/set", inventory.setItem)
}
