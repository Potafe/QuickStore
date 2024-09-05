const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.searchFile = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const { search } = req.query;

  if (!search) {
    return res.redirect("/");
  }

  const files = await prisma.file.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  res.render("search", { files, search });
});
