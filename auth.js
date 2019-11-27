const jwt = require("jsonwebtoken");

const db = require("./db");

function getUsers(req, res) {
    db.query("SELECT * FROM users ORDER BY id ASC").then(result => {
        res.status(200).json(result.rows);
    });
}

function createNewUser({ name, password }) {
    let ifUser = userExists(name).then(res => {
        if (res.rowCount > 0) {
            return 1;
        }
        db.query(
            "INSERT INTO users (name, password) VALUES ($1, crypt($2, gen_salt('bf')));",
            [name, password]
        ).then(result => {
            return { message: "user created", result };
        });
    });
}

function logIn({ name, password }) {
    let noUser = userExists(name).then(user => {
        if (user.rowCount == 0) {
            return 1;
        }
        db.query(
            "select id from users where name = $1 and password = crypt($2, password)",
            [name, password]
        ).then(result => {
            if (result.rowCount == 0) {
                console.log("password failed");
                return 1;
            }
            const token = jwt.sign(result.rows[0], process.env.JWT_SECRET, {expiresIn: '1h'});
            return token;
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
