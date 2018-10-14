const express = require("express"),
    router = express.Router();

const { checkPassword, hashPassword } = require("../pass");
const { createUser, getUser } = require("../queries");

router.use(function logout(req, res, next) {
    if (req.body.logout) {
        req.session = null;
        res.redirect("/login");
    } else {
        next();
    }
});

router.get("/register", (req, res) => {
    let data = {};
    if (req.session.message) {
        data.message = req.session.message;
        req.session.message = null;
    }
    res.render("register", {
        layout: "main",
        data: data
    });
});

router.post("/register", (req, res) => {
    hashPassword(req.body.password).then(hash => {
        createUser(req.body.firstName, req.body.lastName, req.body.email, hash)
            .then(results => {
                req.session.user = results;
                res.redirect("/profile");
            })
            .catch(err => {
                req.session.message = err.message;
                res.redirect("/register");
                console.log("register", err.message);
            });
    });
});

router.get("/login", (req, res) => {
    let data = {};
    if (req.session.message) {
        data.message = req.session.message;
        req.session.message = null;
    }
    res.render("login", {
        layout: "main",
        data: data
    });
});

router.post("/login", (req, res) => {
    getUser(req.body.email)
        .then(results => {
            checkPassword(req.body.password, results.password)
                .then(match => {
                    if (match) {
                        req.session.user = {
                            id: results.id,
                            first_name: results.first_name,
                            last_name: results.last_name
                        };
                        req.session.signatureId = results.sigid;
                        res.redirect("/petition");
                    } else {
                        req.session.message = "bad login";
                        res.redirect("/login");
                    }
                })
                .catch(err => {
                    res.send(`<p>${err}</p>`);
                    console.log("pw", err.message);
                });
        })
        .catch(err => {
            req.session.message = "no such email or password";
            res.redirect("/login");
            console.log("user", err.message);
        });
});

exports.router = router;
