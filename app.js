var createError = require("http-errors");
var express = require("express");
var path = require("path");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passportLocal = require("passport-local");
var passport = require("passport");
const {
  serializeUser,
  deserializeUser,
  authenticateUser,
} = require("./controllers/passport/passport-config");

require("dotenv").config();

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/loginRouter");
var signupRouter = require("./routes/signupRouter");
var uploadRouter = require("./routes/uploadRouter");
var foldersRouter = require("./routes/folderRouter");
var searchRouter = require("./routes/searchRouter");

var app = express();

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);
passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

console.log(process.env.DATABASE_URL);

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/upload", uploadRouter);
app.use("/folders", foldersRouter);
app.use("/search", searchRouter);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
