const express = require("express"),
    router = express.Router();

const {
    updateProfile,
    getProfile,
    writeProfile,
    delProfile
} = require("../queries");

router.use(function deleteProfile(req, res, next) {
    if (req.body.deleteProfile) {
        delProfile(req.session.user.id).then(() => {
            req.session = null;
            res.redirect("/register");
        });
    } else {
        next();
    }
});

router.get("/", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

router.post("/", (req, res) => {
    writeProfile(req.session.user.id, req.body)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => console.log(err.message));
});

router.get("/edit", (req, res) => {
    getProfile(req.session.user.id).then(data => {
        res.render("editprofile", {
            layout: "main",
            data: data
        });
    });
});

router.post("/edit", (req, res) => {
    updateProfile(req.session.user.id, req.body).then(() => {
        req.session.message = "your profile was updated";
        res.redirect("/thanks");
    });
});

exports.router = router;
