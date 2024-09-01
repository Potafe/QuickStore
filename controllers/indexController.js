const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getIndex = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const homeFolder = await prisma.folder.findFirst({
    where: {
      userId: req.user.id,
      AND: { name: "Home" },
    },
    include: {
      children: true,
      files: true,
    },
  });

  res.render("folder", { folder: homeFolder });
});

exports.postIndex = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const { newFolderName } = req.body;
  const userId = req.user.id;

  let homeFolder = await prisma.folder.findFirst({
    where: {
      name: "Home",
      userId: userId,
    },
  });

  if (!homeFolder) {
    homeFolder = await prisma.folder.create({
      data: {
        name: "Home",
        userId: userId,
      },
    });
  } else {
    await prisma.folder.create({
      data: {
        name: newFolderName,
        user: {
          connect: {
            id: userId,
          },
        },
        parent: {
          connect: {
            id: homeFolder.id,
          },
        },
      },
    });
  }

  res.redirect("/");
});
