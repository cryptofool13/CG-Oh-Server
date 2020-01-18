const db = require("../db")

// EXPORTS
module.exports = {
	getItem,
	getAllItems,
	addItem,
	updateInventory,
	setPrice,
	setItem
}

// CONTROLLERS
function getAllItems(req, res) {
	db.query("SELECT * from items ORDER BY upc DESC").then(result => {
		return res.json({ items: result.rows })
	})
}

function getItem(req, res) {
	let upc = req.params.upc

	db.query(
		"SELECT item, upc, on_hand, shelf_cap, case_sz, price FROM items WHERE upc = $1",
		[upc]
	).then(result => {
		if (result.rowCount < 1) {
			res.json({ error: `${upc} not in database` })
		}
		return res.json(result.rows[0])
	})
}

function addItem(req, res) {
	// insert an item into ITEMS table
	const { upc, item, on_hand, shelf_cap, case_sz, price } = req.body

	// check if item exists
	db.query("SELECT upc FROM items WHERE upc = $1", [upc]).then(checkResult => {
		if (checkResult.rowCount > 0) {
			return res
				.status(409)
				.json({ error: `item already exists with upc: ${upc}` })
		}
		// if not, save item to db
		db.query("INSERT INTO items VALUES ($1, $2, $3, $4, $5, $6)", [
			upc,
			item,
			on_hand,
			shelf_cap,
			case_sz,
			price
		]).then(saveResult => {
			return res.json({ message: "successfully added item to database" })
		})
	})
}

function updateInventory(req, res) {
	// look up an item and set the on_hand field
	const { on_hand, shelf_cap } = req.body
	const upc = req.params.upc

	db.query("UPDATE items SET on_hand = $1, shelf_cap = $2 WHERE upc = $3", [
		on_hand,
		shelf_cap,
		upc
	])
		.then(result => {
			return res.json({ result })
		})
		.catch(e => {
			return res.json({ error: "update failed" })
		})
}

function setPrice(req, res) {
	const { price } = req.body
	const upc = req.params.upc

	db.query("UPDATE items SET price = $1 WHERE upc = $2", [price, upc])
		.then(result => {
			res.json({ result })
		})
		.catch(e => {
			return res.json({ error: e })
		})
}

function setItem(req, res) {
	const { item, on_hand, shelf_cap, case_sz, price } = req.body
	const upc = req.params.upc

	db.query(
		"UPDATE items SET item = $1, on_hand = $2, shelf_cap = $3, case_sz = $4, price = $5 WHERE upc = $6",
		[item, on_hand, shelf_cap, case_sz, price, upc]
	)
		.then(_ => {
			db.query("SELECT * FROM items WHERE upc = $1", [upc]).then(result => {
				res.json({ result })
			})
		})
		.catch(e => {
			res.json({ error: e })
		})
}
