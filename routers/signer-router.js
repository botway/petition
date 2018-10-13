const express = require("express"),
    router = express.Router();

const { delSig, getSig } = require("../queries/q-sig");
const {
    getNumSigners,
    getAllSigners,
    getSignersCity
} = require("../queries/q-signers");

router.use(function deleteSig(req, res, next) {
    if (req.body.deleteSig) {
        delSig(req.session.user.id).then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        });
    } else {
        next();
    }
});

router.get("/thanks", (req, res) => {
    let data = {};
    if (req.session.message) {
        data.message = req.session.message;
    }
    getNumSigners().then(num => {
        getSig(req.session.signatureId).then(sig => {
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

router.get("/signers", (req, res) => {
    getAllSigners().then(users => {
        res.render("signers", {
            layout: "main",
            users: users,
            user_id: req.session.user.id
        });
    });
});

router.get("/signers/:city", (req, res) => {
    getSignersCity(req.params.city).then(users => {
        res.render("signers", {
            layout: "main",
            users: users,
            city: req.params.city,
            user_id: req.session.user.id
        });
    });
});

exports.router = router;
