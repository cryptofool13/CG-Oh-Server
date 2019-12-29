const db = require("../db")
const { isValidUpc } = require("../helpers/util")

module.exports = {}

// generate an update query to insert into transaction
// throw error if upc is invalid or if ct variable is not an Int > 0
function updateItem({ upc, ct }) {
	if (!isValidUpc(upc)) {
		throw Error(`invalid upc: ${upc}`)
	}
	if (ct < 1 || !Number.isInteger(ct)) {
		throw Error(`invalid count: ${ct}`)
	}
	return `UPDATE items SET on_hand = on_hand - ${ct} WHERE upc = '${upc}'`
}

// assume req.body holds array of {upc, ct}
function purchaseItems(req, res) {
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

		client.query('BEGIN', err => {
			if(shouldAbort(err)) {
				res.status(500).json({error: err})
			}
			
		})
	})
}
// const shouldAbort = err => {
//   if (err) {
//     console.error('Error in transaction', err.stack)
//     client.query('ROLLBACK', err => {
//       if (err) {
//         console.error('Error rolling back client', err.stack)
//       }
//       // release the client back to the pool
//       done()
//     })
//   }
//   return !!err
// }
console.log(updateItem({ id: "121212121212", ct: 14 }))
