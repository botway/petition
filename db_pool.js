const pg = require("pg");
const { dbUser, dbPassword } = require("./secrets");
let dbUrl = `postgres:${dbUser}:${dbPassword}@localhost:5432/petition`;

dbUrl = require("url").parse(dbUrl);

var dbConfig = {
    user: dbUser,
    database: dbUrl.pathname.slice(1),
    password: dbPassword,
    host: dbUrl.hostname,
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};

const pool = new pg.Pool(dbConfig);

pool.on("error", function(err) {
    console.log(err);
});

const setSignature = function(firstName, lastName, sig) {
    pool.connect((err, client, done) => {
        if (!err) {
            console.log("query");
            client.query(
                `INSERT INTO signatures (first_name, last_name, sig) VALUES ($1, $2, $3)`,
                [firstName, lastName, sig],
                (err, data) => {
                    if (!err) {
                        console.log(data);
                    }
                    done();
                }
            );
        } else {
            console.log("erro", err);
        }
    });
};
exports.setSignature = setSignature;
// exports.getSignatures(firstName, lastname) {
//     return client.query(
//         `SELECT * FROM signatures WHERE firstName = $1 AND lastName = $2`,
//         [firstName,lastNAme]
//     );
// }
