const db = require("../db").db;

const createUser = function(first, last, email, hashedPw) {
    const q = `
        INSERT INTO registered_users
        (first_name, last_name, email, password)
        VALUES
        ($1,$2,$3,$4)
        RETURNING id, first_name,last_name, email;
    `;

    const params = [
        first || null,
        last || null,
        email || null,
        hashedPw || null
    ];

    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log(err.message);
        });
};

const getUser = function(email) {
    const q = `
        SELECT first_name,
        last_name,
        registered_users.id,
        password,
        signatures.id AS sigId
        FROM registered_users
        FULL OUTER JOIN signatures
        ON registered_users.id = signatures.uid
        WHERE email = $1;
    `;
    const params = [email || null];

    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log(err.message);
        });
};

module.exports = {
    createUser,
    getUser
};
