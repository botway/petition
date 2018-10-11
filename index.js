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

app.engine(
    "handlebars",
    hb({
        helpers: {
            toLowerCase: function(str) {
                return str.toLowerCase();
            },
            toUpperCase: function(str) {
                return str.toUpperCase();
            },
            compare: function(a, b) {
                console.log("comparing", a, b);
                return true;
            }
        }
    })
);

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

app.use(function deleteSig(req, res, next) {
    if (req.body.deleteSig) {
        db.delSig(req.session.user.id).then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        });
    } else {
        next();
    }
});

app.use(function deleteProfile(req, res, next) {
    if (req.body.deleteProfile) {
        db.delProfile(req.session.user.id).then(() => {
            req.session = null;
            res.redirect("/register");
        });
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
    let data = {};
    if (req.session.err) {
        data.message = req.session.err;
        req.session.err = null;
    }
    res.render("register", {
        layout: "main",
        data: data
    });
});

app.post("/register", (req, res) => {
    db.hashPassword(req.body.password).then(hash => {
        db.createUser(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            hash
        )
            .then(results => {
                req.session.user = results;
                res.redirect("/profile");
            })
            .catch(err => {
                req.session.err = err.message;
                res.redirect("/register");
                // console.log("register", err.message);
            });
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    db.writeProfile(req.session.user.id, req.body)
        .then(results => {
            res.redirect("/petition");
        })
        .catch(err => console.log(err.message));
});

app.get("/profile/edit", (req, res) => {
    db.getProfile(req.session.user.id).then(data => {
        res.render("editprofile", {
            layout: "main",
            data: data
        });
    });
});

app.post("/profile/edit", (req, res) => {
    db.updateProfile(req.session.user.id, req.body).then(results => {
        req.session.message = "your profile was updated";
        res.redirect("/thanks");
    });
});

app.get("/login", (req, res) => {
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

app.post("/login", (req, res) => {
    db.getUser(req.body.email)
        .then(results => {
            db.checkPassword(req.body.password, results.password)
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
            console.log("user", err.message);
        });
});

app.get("/thanks", (req, res) => {
    // let data = req.session.user;
    let data = {};
    if (req.session.message) {
        data.message = req.session.message;
    }
    db.getNumSigners().then(num => {
        db.getSig(req.session.signatureId).then(sig => {
            data.signers = num;
            data.sig = sig;
            data.first_name = req.session.user.first_name;
            data.last_name = req.session.user.last_name;
            res.render("thanks", {
                layout: "main",
                data: data
            });
        });
    });
});

app.get("/signers", (req, res) => {
    db.getAllSigners().then(users => {
        // users.owner_id = req.session.user.id;
        console.log(users);
        res.render("signers", {
            layout: "main",
            data: users
        });
    });
});

app.get("/signers/:city", (req, res) => {
    db.getSignersCity(req.params.city).then(users => {
        res.render("signers", {
            layout: "main",
            data: users,
            city: req.params.city
        });
    });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("listening on 8080");
});
