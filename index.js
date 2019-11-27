const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();

const router = require("./router");

const app = express();
const api = express();

router(api);

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1", api);

app.listen(port, listening);

function listening() {
  console.log(`API listening at http://localhost:${port}/`);
}
