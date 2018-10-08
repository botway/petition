const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const helmet = require("helmet");

app.use(helmet());

const bodyParser = require("body-parser");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(function logout(req, res, next) {
    if (req.body.logout) {
        req.session = null;
        res.redirect("/login");
    } else {
        next();
    }
});

function checkForUser(req, res, next) {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
}

function checkForSig(req, res, next) {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        next();
    }
}

app.get("/", checkForUser, (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", checkForUser, checkForSig, (req, res) => {
    // console.log("USER", req.session.user);
    res.render("petition", {
        layout: "main",
        data: req.session.user
    });
});

app.post("/petition", (req, res) => {
    db.setSig(req.session.user.id, req.body.sig).then(id => {
        req.session.signatureId = id;
        res.redirect("/thanks");
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    console.log("register");
    db.hashPassword(req.body.password).then(hash => {
        db.createUser(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            hash
        )
            .then(results => {
                req.session.user = results;
                res.redirect("/petition");
            })
            .catch(err => console.log("register", err.message));
    });
});

app.get("/login", (req, res) => {
    let data = {};
    if (req.session.badlogin) {
        data.message = "need valid password/email";
        req.session.badlogin = null;
    }
    res.render("login", {
        layout: "main",
        data: data
    });
});

app.post("/login", (req, res) => {
    db.getUser(req.body.email)
        .then(results => {
            db.checkPassword(req.body.password, results.password)
                .then(() => {
                    req.session.user = {
                        id: results.id,
                        first_name: results.first_name,
                        last_name: results.last_name
                    };
                    req.session.signatureId = results.id; //should be changed
                    res.redirect("/petition");
                })
                .catch(err => {
                    res.send(`<p>${err}</p>`);
                    console.log("pw", err.message);
                });
        })
        .catch(err => {
            req.session.badlogin = true;
            res.redirect("/login");
            console.log("user", err.message);
        });
});

app.get("/thanks", (req, res) => {
    db.getNumSigners().then(num => {
        db.getSig(req.session.signatureId).then(sig => {
            res.render("thanks", {
                layout: "main",
                signers: num,
                sig: sig
            });
        });
    });
});

app.get("/signers", (req, res) => {
    db.getAll().then(users => {
        res.render("signers", {
            layout: "main",
            users: users
        });
    });
});

app.listen(8080, () => {
    console.log("listening on 8080");
});
