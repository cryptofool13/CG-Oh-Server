const db = require("../db")
const { isValidUpc, flattenItems } = require("../helpers/util")

module.exports = {}

// generate an update query to insert into transaction
// throw error if upc is invalid or if ct variable is not an Int > 0
function updateItem(ct, upc) {
	// TODO: move V this logic to POS api V
	// if (!isValidUpc(upc)) {
	// 	throw Error(`invalid upc: ${upc}`)
	// }
	// if (ct < 1 || !Number.isInteger(ct)) {
	// 	throw Error(`invalid count: ${ct}`)
	// }
	return `UPDATE items SET on_hand = on_hand - ${ct} WHERE upc = '${upc}';`
}

function buildTransaction(items) {
	let query = ""
	for (let i = 0; i < items.length; i += 2) {
		let ct = `$${i + 1}`
		let upc = `$${i + 2}`
		query += updateItem(ct, upc)
	}
	return query
}

// assume req.body holds array of {upc, ct}
function purchaseItems(req, res) {
	const items = flattenItems(req.body.items)
	db.pool.connect((err, client, done) => {
		const shouldAbort = err => {
			if (err) {
				console.error("Error in transaction", err.stack)
				client.query("ROLLBACK", err => {
					if (err) {
						console.error("Error rolling back client", err.stack)
					}
					// release the client back to the pool
					done()
				})
			}
			return !!err
		}

		client.query("BEGIN", err => {
			if (shouldAbort(err)) {
				res.status(500).json({ error: err })
			}
			const queryText = buildTransaction(items)
			client.query(queryText, items, (err, result) => {
				if (shouldAbort(err)) {
					res.status(500).json({ error: err })
				}

				client.query('COMMIT', err => {
					if(err) {
						res.status(500).json({ error: err })
					}
					 done()
				})
			})
		})
	})
}
