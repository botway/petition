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

module.exports = {
    hashPassword,
    checkPassword
};
