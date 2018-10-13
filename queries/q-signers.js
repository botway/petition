const db = require("../db").db;

const getNumSigners = function() {
    return db
        .query(`SELECT COUNT (*) FROM signatures;`)
        .then(results => {
            return results.rows[0].count;
        })
        .catch(err => {
            console.log(err.message);
        });
};

const getAllSigners = function() {
    const q = `
        SELECT first_name,last_name, age, city,homepage, registered_users.id as uid
        FROM registered_users
        LEFT JOIN user_profiles
        ON registered_users.id = user_profiles.uid
        INNER JOIN signatures
        ON registered_users.id = signatures.uid;
    `;
    return db
        .query(q)
        .then(results => {
            return results.rows;
        })
        .catch(err => console.log(err.message));
};

const getSignersCity = function(city) {
    const q = `
        SELECT first_name,last_name, age, homepage, registered_users.id as uid
        FROM registered_users
        INNER JOIN user_profiles
        ON registered_users.id = user_profiles.uid
        INNER JOIN signatures
        ON registered_users.id = signatures.uid
        WHERE LOWER(user_profiles.city) = LOWER($1);
    `;
    const params = [city || null];

    return db
        .query(q, params)
        .then(results => {
            return results.rows;
        })
        .catch(err => console.log(err.message));
};

module.exports = {
    getNumSigners,
    getAllSigners,
    getSignersCity
};
