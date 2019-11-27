const jwt = require("jsonwebtoken");

const db = require("./db");

function getUsers(req, res) {
    db.query("SELECT * FROM users ORDER BY id ASC").then(result => {
        res.status(200).json(result.rows);
    });
}

function createNewUser(req, res) {
    let { name, password } = req.body;
    if (!name || !password) {
        return res
            .status(422)
            .send({ message: "must supply name and password" });
    }
    let ifUser = userExists(name).then(user => {
        if (user.rowCount > 0) {
            return res.status(400).send({ message: "user already exists" });
        }
        db.query(
            "INSERT INTO users (name, password) VALUES ($1, crypt($2, gen_salt('bf')));",
            [name, password]
        ).then(result => {
            return res.status(200).send({ message: "user created" });
        });
    });
}

function logIn(req, res) {
    let { name, password } = req.body;
    if (!name || !password) {
        return res
            .status(422)
            .send({ message: "must supply name and password" });
    }

    let noUser = userExists(name).then(user => {
        if (user.rowCount == 0) {
            return res.status(400).send({ message: "user does not exist" });
        }
        db.query(
            "select id from users where name = $1 and password = crypt($2, password)",
            [name, password]
        ).then(result => {
            if (result.rowCount == 0) {
                return res.status(400).send({ message: "incorrect password" });
            }
            const token = jwt.sign(result.rows[0], process.env.JWT_SECRET, {
                expiresIn: "1h"
            });
            return res.status(200).send(token);
        });
    });
}

function userExists(username) {
    return db.query("SELECT * FROM users WHERE name = $1;", [username]);
}

module.exports = {
    getUsers,
    logIn,
    userExists,
    createNewUser
};
