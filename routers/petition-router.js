const express = require("express"),
    router = express.Router();

const { setSig } = require("../queries/q-sig");

const { checkForUser, checkForSig } = require("../middleware");

router.get("/", checkForUser, checkForSig, (req, res) => {
    res.render("petition", {
        layout: "main",
        data: req.session.user
    });
});

router.post("/", (req, res) => {
    setSig(req.session.user.id, req.body.sig).then(id => {
        req.session.signatureId = id;
        res.redirect("/thanks");
    });
});

exports.router = router;
