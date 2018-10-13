const express = require("express");
const app = express();

const hb = require("express-handlebars");

const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const csurf = require("csurf");
const helmet = require("helmet");

// const db = require("./db");

const profileRouter = require("./routers/profile-router").router;
const petitionRouter = require("./routers/petition-router").router;
const authRouter = require("./routers/auth-router").router;
const signerRouter = require("./routers/signer-router").router;

const hbHelpers = require("./hb-helpers");

exports.app = app;

const { checkForUser } = require("./middleware");

app.use(helmet());

app.engine(
    "handlebars",
    hb({
        helpers: hbHelpers.helpers
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

app.use("/profile", profileRouter);
app.use("/petition", petitionRouter);
app.use("/petition", petitionRouter);
app.use("/", authRouter);
app.use("/", signerRouter);

app.get("/", checkForUser, (req, res) => {
    res.redirect("/petition");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("listening on 8080");
});
