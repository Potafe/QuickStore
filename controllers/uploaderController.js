require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
var fs = require("fs");

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.postUploadFile = asyncHandler(async function (req, res) {
  if (!req.file) {
    return res.redirect(`/folders/${req.params.id}`);
  }

  const file = req.file;
  const folderId = req.params.id;

  let result;
  if (file.mimetype.startsWith("image/")) {
    result = await cloudinary.uploader.upload(file.path);
  } else if (file.mimetype.startsWith("video/")) {
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
    });
  } else {
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
    });
  }

  await prisma.file.create({
    data: {
      name: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: file.mimetype,
      folder: {
        connect: {
          id: folderId,
        },
      },
    },
  });

  fs.unlinkSync(file.path);

  res.redirect(`/folders/${folderId}`);
});

exports.getUploadFile = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const publicId = req.params.id;

    const file = await prisma.file.findUnique({
      where: { publicId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const resourceType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "raw";

    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    res.render("upload", { result, file });
  } catch (error) {
    console.error("Error fetching resource from Cloudinary:", error);
    res.status(500).send("Internal Server Error");
  }
});

exports.postDeleteFile = asyncHandler(async function (req, res) {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const publicId = req.params.id;

    const fileRecord = await prisma.file.findUnique({
      where: { publicId },
    });

    if (!fileRecord) {
      return res.status(404).send("File not found");
    }

    await cloudinary.uploader.destroy(publicId);
    await prisma.file.delete({
      where: { publicId },
    });

    res.redirect(`/folders/${fileRecord.folderId}`);
  } catch (error) {
    console.error("Error deleting resource from Cloudinary:", error);
    res.status(500).send("Internal Server Error");
  }
});
