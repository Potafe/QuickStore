const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.serializeUser = (user, done) => {
  done(null, user.id);
};

exports.deserializeUser = asyncHandler(async function (id, done) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    done(null, user);
  } catch (err) {
    return done(err);
  }
});

exports.authenticateUser = asyncHandler(async function (email, password, done) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return done(null, false, { message: "Incorrect email" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
