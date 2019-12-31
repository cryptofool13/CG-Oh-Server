const redis = require("redis")
const { promisify } = require("util")

const client = redis.createClient()

client.on("error", err => {
	console.log(`redis error ${err}`)
})

const getAsync = promisify(client.get).bind(client)

module.exports = { client, getAsync }
