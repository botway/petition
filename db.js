var spicedPg = require("spiced-pg");
const { dbUser, dbPassword } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/petition`);

const setSig = function(firstName, lastName, sig) {
    return db
        .query(
            `INSERT INTO signatures (first_name, last_name, sig) VALUES ($1, $2, $3)`,
            [firstName, lastName, sig]
        )
        .then(function(results) {
            return results.rows;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getSig = function(firstName, lastName) {
    return db
        .query(
            `SELECT sig FROM signatures WHERE first_name = $1 AND last_name = $2`,
            [firstName, lastName]
        )
        .then(function(results) {
            return results.rows;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getAll = function() {
    return db
        .query(`SELECT first_name, last_name FROM signatures`)
        .then(function(results) {
            return results.rows;
        })
        .catch(function(err) {
            console.log(err);
        });
};

module.exports.setSig = setSig;
module.exports.getSig = getSig;
module.exports.getAll = getAll;
