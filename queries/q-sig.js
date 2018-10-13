const db = require("../db").db;

const setSig = function(uid, sig) {
    return db
        .query(
            `INSERT INTO signatures (uid, sig) VALUES ($1, $2) RETURNING id;`,
            [uid, sig]
        )
        .then(results => {
            return results.rows[0].id;
        })
        .catch(err => {
            console.log(err);
        });
};

const getSig = function(id) {
    return db
        .query(`SELECT sig FROM signatures WHERE id=$1;`, [id])
        .then(function(results) {
            return results.rows[0].sig;
        })
        .catch(err => {
            console.log(err.message);
        });
};

const delSig = function(id) {
    return db
        .query(`DELETE FROM signatures WHERE uid=$1;`, [id])
        .then(() => {
            return true;
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports = {
    delSig,
    getSig,
    setSig
};
