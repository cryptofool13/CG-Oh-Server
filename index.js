const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();

const { getUsers, userExists, createNewUser, logIn } = require("./auth");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logIn({ name: "mike", password: "krud_WAF_9!" });

app.get("/", getUsers);

app.listen(port, listening);

function rootHandler(req, res) {
    res.send("CGO API");
}

function listening() {
    console.log(`API listening at http://localhost:${port}/`);
}
