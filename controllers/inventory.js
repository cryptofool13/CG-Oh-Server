const db = require("../db");
const { isValidUpc } = require("../helpers/util");

module.exports = {
  getItem
};

function getItem(req, res) {
  let upc = req.params.upc;

  if (upc.length !== 12) {
    res.status(422).send({ message: "invalid upc, must be of length 12" });
  }
  if (!isValidUpc(upc)) {
    res.status(422).send({ message: "invalid check digit" });
  }
  db.query(
    "SELECT item, on_hand, shelf_cap, case_sz, price FROM items WHERE upc = $1",
    [upc]
  ).then(result => {
    if (result.rowCount < 1) {
      res.send({ message: `${upc} not in database` });
    }
    res.send(result.rows[0]);
  });
}

function addItem(req, res) {
  const { upc, item, on_hand, shelf_cap, case_sz, price } = req.body;
  // check input
  // check if item exists
  // if not, save item to db
}
