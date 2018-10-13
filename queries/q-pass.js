const db = require("../db").db;
const bcrypt = require("bcryptjs");

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

const updatePassword = function(id, textPass) {
    return hashPassword(textPass)
        .then(hashed => {
            return db
                .query(
                    "UPDATE registered_users SET password = $2 WHERE id=$1;",
                    [id, hashed]
                )
                .then(() => {
                    return true;
                })
                .catch(err => console.log("pass", err.message));
        })
        .catch(err => console.log(err.message));
};

module.exports = {
    updatePassword,
    hashPassword,
    checkPassword
};
