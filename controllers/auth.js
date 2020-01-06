const jwt = require("jsonwebtoken")

const db = require("../db")

// EXPORTS
module.exports = {
	getUsers,
	logIn,
	createNewUser,
	deleteUser
}

// CONTROLLERS
function getUsers(req, res) {
	db.query("SELECT * FROM users ORDER BY id ASC").then(result => {
		res.status(200).json(result.rows)
	})
}

function createNewUser(req, res) {
	let { name, password, role } = req.body
	if (!name || !password) {
		return res.status(422).json({ error: "must supply name and password" })
	}
	if (role !== "admin" && role !== "manager") {
		role = "employee"
	}
	let ifUser = userByName(name).then(user => {
		if (user.rowCount > 0) {
			return res.status(400).json({ error: "user already exists" })
		}
		db.query(
			"INSERT INTO users (name, password, role) VALUES ($1, crypt($2, gen_salt('bf')), $3);",
			[name, password, role]
		).then(_ => {
			db.query("SELECT id, role FROM users WHERE name = $1", [name]).then(
				result => {
					const token = jwt.sign(result.rows[0], process.env.JWT_SECRET, {
						expiresIn: "1h"
					})
					return res.status(200).json({token})
				}
			)
		})
	})
}

function logIn(req, res) {
	let { name, password } = req.body
	if (!name || !password) {
		return res.status(422).json({ error: "must supply name and password" })
	}

	let ifUser = userByName(name).then(user => {
		if (user.rowCount == 0) {
			return res.status(400).json({ error: "user does not exist" })
		}
		db.query(
			"select id, role from users where name = $1 and password = crypt($2, password)",
			[name, password]
		).then(result => {
			if (result.rowCount == 0) {
				return res.status(400).json({ error: "incorrect password" })
			}
			const token = jwt.sign(result.rows[0], process.env.JWT_SECRET, {
				expiresIn: "1h"
			})
			return res.status(200).json({ token })
		})
	})
}

function deleteUser(req, res) {
	let { id } = req.body
	if (!id) {
		return res.status(422).json({ message: "must supply user id" })
	}

	let ifUser = userById(id).then(user => {
		if (user.rowCount == 0) {
			return res.status(400).json({ message: "user does not exist" })
		}

		db.query("DELETE FROM users where id = $1", [id]).then(result => {
			res.json({ result })
		})
	})
}

// HELPER FUNCTIONS
function userByName(username) {
	return db.query("SELECT * FROM users WHERE name = $1;", [username])
}

function userById(id) {
	return db.query("SELECT * FROM users WHERE id = $1;", [id])
}

function determineRole(token) {
	let decoded = jwt.verify(token, process.env.JWT_SECRET)
}
