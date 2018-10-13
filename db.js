const spicedPg = require("spiced-pg");

let secrets;
if (process.env.NODE_ENV === "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${secrets.dbUser}:${
            secrets.dbPassword
        }@localhost:5432/petition`
);

module.exports.db = db;
