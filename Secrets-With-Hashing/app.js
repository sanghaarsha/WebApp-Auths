const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
require("dotenv").config();

const PORT = process.env.PORT || 6969;

// Middlewares for App
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connecting mongoose
const databaseURL = process.env.dbURL;
mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Creating Schema
let userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// Creating User Model
const User = new mongoose.model("User", userSchema);

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
    res.redirect("/");
});

// post routes

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password),
    });

    newUser
        .save()
        .then((result) => res.render("secrets"))
        .catch((err) => console.log(err));
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password); // converting to hash
    // hash of same password will be same

    User.findOne({ email: username })
        .then((result) => {
            if (result) {
                if (password === result.password) {
                    res.render("secrets");
                } else {
                    res.render("login-error.ejs");
                }
            } else {
                res.render("404.ejs");
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

// 404
app.use((req, res) => {
    res.render("404.ejs");
});

// Listen
app.listen(PORT, () => console.log(`App live at http://localhost:${PORT}`));
