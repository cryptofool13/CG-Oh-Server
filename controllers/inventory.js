const db = require("../db")

module.exports = {
	getItem,
	getAllItems,
	addItem
}

function getAllItems(req, res) {
	db.query("SELECT * from items ORDER BY upc DESC").then(result => {
		res.send({ items: result.rows })
	})
}

function getItem(req, res) {
	let upc = req.params.upc

	db.query(
		"SELECT item, on_hand, shelf_cap, case_sz, price FROM items WHERE upc = $1",
		[upc]
	).then(result => {
		if (result.rowCount < 1) {
			res.send({ message: `${upc} not in database` })
		}
		res.send(result.rows[0])
	})
}

function addItem(req, res) {
	// insert an item into ITEMS table
	const { upc, item, on_hand, shelf_cap, case_sz, price } = req.body

	// check if item exists
	db.query("SELECT upc FROM items WHERE upc = $1", [upc]).then(checkResult => {
		if (checkResult.rowCount > 0) {
			res.status(409).send({ message: `item already exists with upc: ${upc}` })
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
			res.send({ message: "successfully added item to database" })
		})
	})
}

function setInventory(req, res) {
	// look up an item and set the on_hand field
	const { upc, input } = req.body
}
