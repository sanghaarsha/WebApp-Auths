// dotenv & port
require("dotenv").config();
const PORT = process.env.PORT || 6969;

const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// Middlewares for App
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

// Session is used just below other middlewares and before connecting to database
app.use(
    session({
        secret: "password",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Connecting mongoose
const databaseURL = process.env.dbURL;
mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

// Creating Schema
let userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

// Creating User Model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Main routes
app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/submit", (req, res) => {
    res.render("submit.ejs");
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
});

// post routes

app.post("/register", (req, res) => {
    User.register(
        {
            username: req.body.username,
        },
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.render("reg-error.ejs");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.render("login-error.ejs");
        } else {
            passport.authenticate("local");
            res.redirect("/secrets");
        }
    });
});

// 404
app.use((req, res) => {
    res.render("404.ejs");
});

// Listen
app.listen(PORT, () => console.log(`App live at http://localhost:${PORT}`));
