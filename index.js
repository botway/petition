const express = require("express");
const app = express();
const hb = require("express-handlebars");
const bodyParser = require("body-parser");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.get("/thanks", (req, res) => {
    db.getAll().then(users => {
        res.render("thanks", {
            layout: "main",
            users: users
        });
    });
});

app.post("/", (req, res) => {
    db.setSig(req.body.firstName, req.body.lastName, req.body.sig);
    res.redirect("/thanks");
});

app.listen(8080, () => {
    console.log("listening on 8080");
});
