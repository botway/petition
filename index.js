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

app.get("/", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
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

app.post("/", (req, res) => {
    db.setSig(req.body.firstName, req.body.lastName, req.body.sig).then(id => {
        req.session.signatureId = id;
        res.redirect("/thanks");
    });
});

app.listen(8080, () => {
    console.log("listening on 8080");
});
