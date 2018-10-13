const db = require("../db").db;
const { updatePassword } = require("../queries/q-pass");
const { delSig } = require("../queries/q-sig");

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
    let promises;

    if (data.password != "") {
        const pass = updatePassword(id, data.password);
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

module.exports = {
    updateProfile,
    updateRegUser,
    getProfile,
    writeProfile,
    delProfile
};
