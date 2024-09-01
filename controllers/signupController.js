const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.getSignUp = (req, res) => {
  res.render("signup");
};

exports.postSignUp = asyncHandler(async function (req, res, next) {
  const { email, password, name } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.folder.create({
      data: {
        name: "Home",
        userId: user.id,
      },
    });

    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/signup",
    })(req, res, next);
  } catch (err) {
    next(err);
  }
});
