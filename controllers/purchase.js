const db = require("../db")
const { client, getAsync } = require("../cache")
const { isValidUpc, flattenItems } = require("../helpers/util")

// EXPORTS
module.exports = {
	purchaseItems
}

// CONTROLLERS
// assume req.body holds array of {upc, ct}
function purchaseItems(req, res) {
	const items = flattenItems(req.body.items)
	listify(items)

	let updateError
	
	client.exists("items", (err, exists) => {
		if (exists) {
			client.llen("items", (err, len) => {
				for (let i = 0; i < len; i++) {
					client.rpop("items", (err, item) => {
						let [ct, upc] = item.split(" ")
						db.query("UPDATE items SET on_hand = on_hand - $1 WHERE upc = $2", [
							ct,
							upc
						]).then().catch(e => {console.log(e)})
					})
				}
				return res.send({ message: "purchase successful" })
			})
		}
	})
}

// HELPER FUNCTIONS
// generate an update query to insert into transaction
function listify(list) {
	for (let i = 0, len = list.length - 1; i < len; i += 2) {
		client.lpush("items", `${list[i]} ${list[i + 1]}`)
	}
}
