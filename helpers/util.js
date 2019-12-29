const isEven = n => n % 2 == 0

function checkDigit(upc) {
	if (upc.length !== 11) {
		throw new Error("must enter 11 digits")
	}
	let even = 0,
		odd = 0
	for (let i = 0; i < 11; i++) {
		if (isEven(i)) {
			even += parseInt(upc[i])
		} else {
			odd += parseInt(upc[i])
		}
	}
	let sum = odd + even * 3
	let check = 0
	while ((check + sum) % 10 !== 0) {
		check++
	}
	return check
}

function isValidUpc(upc) {
	if (upc.length != 12) {
		return false
	}
	let check = upc[upc.length - 1]
	return checkDigit(upc.slice(0, -1)) == check
}

// items = [{upc, ct}]
// returns [ct1, upc1, ..., ct#, upc#] (flat)
function flattenItems(items) {
	let flattened = []
	items.forEach(item => {
		flattened.push(item.ct, item.upc)
	})
	return flattened
}

module.exports = {
	isValidUpc,
	flattenItems
}
