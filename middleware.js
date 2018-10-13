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

const requireLoggedIn = (req, res, next) => {
    if (!req.session.userId && req.url != "/login" && req.url != "register") {
        res.redirect("/register");
    } else {
        next();
    }
};

module.exports = {
    checkForUser,
    checkForSig,
    requireLoggedIn
};
