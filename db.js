var spicedPg = require("spiced-pg");
const { dbUser, dbPassword } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/petition`);

const setSig = function(firstName, lastName, sig) {
    return db
        .query(
            `INSERT INTO signatures (first_name, last_name, sig) VALUES ($1, $2, $3) RETURNING id`,
            [firstName, lastName, sig]
        )
        .then(function(results) {
            return results.rows[0].id;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getSig = function(id) {
    return db
        .query(`SELECT sig FROM signatures WHERE id=$1`, [id])
        .then(function(results) {
            console.log("sig", results.rows);
            return results.rows[0].sig;
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

const getNumSigners = function() {
    return db
        .query(`SELECT COUNT (*) FROM signatures`)
        .then(function(results) {
            return results.rows[0].count;
        })
        .catch(function(err) {
            console.log(err);
        });
};

module.exports.setSig = setSig;
module.exports.getSig = getSig;
module.exports.getAll = getAll;
module.exports.getNumSigners = getNumSigners;
