const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.getAllFolders = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const allFolders = await prisma.folder.findMany({
    where: { userId: req.user.id },
  });

  res.render("allFolders", { allFolders });
});

exports.getFolder = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
    include: { children: true, files: true },
  });

  res.render("folder", { folder });
});

exports.postHomeFolder = asyncHandler(async function (req, res) {
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
  }

  // Check if the folder already exists before creating a new one
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: newFolderName,
      userId: userId,
      parentId: homeFolder.id,
    },
  });

  if (!existingFolder) {
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
  } else {
    // Optionally handle the case where the folder already exists
    // For example, you might want to send an error message to the user
    // res.status(400).send("Folder already exists");
  }

  res.redirect("/");
});

exports.postFolder = asyncHandler(async function (req, res) {
  if (!req.user) {
    res.redirect("/login");
  }

  const { newFolderName } = req.body;
  const userId = req.user.id;

  const parentFolder = await prisma.folder.findUnique({
    where: { id: req.params.id },
  });

  if (!parentFolder) {
    res.redirect("/");
  }

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
          id: parentFolder.id,
        },
      },
    },
  });

  res.redirect("/folder/" + parentFolder.id);
});

exports.postFolderDelete = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
    include: { files: true, children: true },
  });

  if (!folder || folder.name === "Home") {
    return res.redirect("/");
  }

  await prisma.file.deleteMany({
    where: { folderId: req.params.id },
  });

  for (const child of folder.children) {
    await postFolderDeleteAllFiles(child.id);
  }

  await prisma.folder.delete({
    where: { id: req.params.id },
  });

  res.redirect("/");
});

exports.postFolderDeleteAllFiles = asyncHandler(async function (folderId) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      files: true,
      children: true,
    },
  });

  if (!folder) return;

  await prisma.file.deleteMany({
    where: { folderId: folderId },
  });

  for (const child of folder.children) {
    await folderDeleteRecursive(child.id);
  }

  await prisma.folder.delete({
    where: { id: folderId },
  });
});

exports.postFolderRename = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  const { renameFolderName } = req.body;

  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
  });

  if (!folder || folder.name === "Home") {
    return res.redirect("/");
  }

  await prisma.folder.update({
    where: { id: folder.id },
    data: { name: renameFolderName },
  });

  res.redirect("/folders/" + folder.id);
});
