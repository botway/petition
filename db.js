var spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
const { dbUser, dbPassword } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPassword}@localhost:5432/petition`);

const setSig = function(uid, sig) {
    return db
        .query(
            `INSERT INTO signatures (uid, sig) VALUES ($1, $2) RETURNING id`,
            [uid, sig]
        )
        .then(results => {
            return results.rows[0].id;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getUser = function(email) {
    const q = `
        SELECT first_name, last_name, id, password
        FROM registered_users
        WHERE email = $1;
    `;
    const params = [email || null];

    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

const getSig = function(id) {
    return db
        .query(`SELECT sig FROM signatures WHERE id=$1`, [id])
        .then(function(results) {
            return results.rows[0].sig;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getAll = function() {
    return db
        .query(`SELECT first_name, last_name FROM registered_users`)
        .then(results => {
            return results.rows;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const getNumSigners = function() {
    return db
        .query(`SELECT COUNT (*) FROM signatures`)
        .then(results => {
            return results.rows[0].count;
        })
        .catch(function(err) {
            console.log(err);
        });
};

const createUser = function(first, last, email, hashedPw) {
    const q = `
        INSERT INTO registered_users
        (first_name, last_name, email, password)
        VALUES
        ($1,$2,$3,$4)
        RETURNING id, first_name,last_name, email
    `;

    const params = [
        first || null,
        last || null,
        email || null,
        hashedPw || null
    ];

    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

const hashPassword = function(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

const checkPassword = function(textFromLoginForm, hashedPwFromDb) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(textFromLoginForm, hashedPwFromDb, (err, match) => {
            if (err) {
                reject(err);
            } else {
                resolve(match);
            }
        });
    });
};

module.exports.getSig = getSig;
module.exports.setSig = setSig;
module.exports.getUser = getUser;
module.exports.getAll = getAll;
module.exports.getNumSigners = getNumSigners;
module.exports.createUser = createUser;
module.exports.hashPassword = hashPassword;
module.exports.checkPassword = checkPassword;
