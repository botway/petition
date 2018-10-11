var spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
const { dbUser, dbPassword } = require("./secrets");

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPassword}@localhost:5432/petition`
);
// var dbUrl =
//     process.env.DATABASE_URL ||
//     "postgres://spicedling:password@localhost:5432/petition";

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

const getAllSigners = function() {
    const q = `
        SELECT first_name,last_name, age, city, homepage, registered_users.id as uid
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

const getProfile = function(id) {
    const q = `
        SELECT first_name, last_name, email,
        user_profiles.age, user_profiles.city, user_profiles.homepage
        FROM registered_users
        LEFT JOIN user_profiles
        ON registered_users.id = user_profiles.uid
        WHERE registered_users.id = $1;
    `;
    const params = [id];
    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => console.log(err.message));
};

const updateRegUser = function(id, data) {
    const q = `
            UPDATE registered_users
            SET first_name = $2, last_name = $3, email = $4
            WHERE id = $1
            RETURNING first_name, last_name, email;
        `;

    const params = [id, data.first_name, data.last_name, data.email];

    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => console.log("regUser", err.message));
};

const updateProfile = function(id, data) {
    const reg_user = updateRegUser(id, data);
    const profile = writeProfile(id, data);
    const pass = updatePassword(id, data.password);
    let promises;

    if (data.password) {
        promises = [reg_user, profile, pass];
    } else {
        promises = [reg_user, profile];
    }

    return Promise.all(promises)
        .then(results => {
            const updProfile = Object.assign(results[0], results[1]);
            return updProfile;
        })
        .catch(err => {
            console.log(err.message);
        });
};

const getSignersCity = function(city) {
    const q = `
        SELECT first_name,last_name, age, homepage FROM registered_users
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

const writeProfile = function(id, data) {
    const q = `
        INSERT INTO user_profiles
        (age, city, homepage, uid)
        VALUES
        ($2,$3,$4,$1)
        ON CONFLICT (uid)
        DO UPDATE SET age = $2, city = $3, homepage = $4
        WHERE user_profiles.uid = $1
        RETURNING id, age, city, homepage;
    `;

    const params = [
        id,
        data.age || null,
        data.city || null,
        data.homepage || null
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

const delProfile = function(id) {
    const sig = delSig(id);
    const profile = db
        .query(`DELETE FROM user_profiles WHERE uid=$1;`, [id])
        .then(() => {
            return true;
        })
        .catch(err => {
            console.log(err.message);
        });
    const users = db
        .query(`DELETE FROM registered_users WHERE id=$1;`, [id])
        .then(() => {
            return true;
        })
        .catch(err => {
            console.log(err.message);
        });
    return Promise.all([sig, users, profile]);
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

module.exports.getSig = getSig;
module.exports.setSig = setSig;
module.exports.delSig = delSig;
module.exports.delProfile = delProfile;
module.exports.getUser = getUser;
module.exports.getProfile = getProfile;
module.exports.updateProfile = updateProfile;
module.exports.getAllSigners = getAllSigners;
module.exports.getSignersCity = getSignersCity;
module.exports.getNumSigners = getNumSigners;
module.exports.createUser = createUser;
module.exports.writeProfile = writeProfile;
module.exports.hashPassword = hashPassword;
module.exports.checkPassword = checkPassword;
