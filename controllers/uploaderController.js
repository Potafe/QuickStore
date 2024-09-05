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
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.redirect(`/folders/${req.params.id}`);
    }

    const file = req.file;
    const folderId = req.params.id;

    console.log("File details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    let result;
    if (file.mimetype.startsWith("image/")) {
      console.log("Uploading image to Cloudinary");
      result = await cloudinary.uploader.upload(file.path);
    } else if (file.mimetype.startsWith("video/")) {
      console.log("Uploading video to Cloudinary");
      result = await cloudinary.uploader.upload(file.path, {
        resource_type: "video",
      });
    } else {
      console.log("Uploading raw file to Cloudinary");
      result = await cloudinary.uploader.upload(file.path, {
        resource_type: "raw",
      });
    }

    console.log("Cloudinary upload result:", result);

    // Save file data to Prisma DB
    const savedFile = await prisma.file.create({
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

    console.log("File saved to database:", savedFile);

    // Safely delete the local file after all the operations
    fs.unlinkSync(file.path);

    res.redirect(`/folders/${folderId}`);
  } catch (error) {
    console.error("Error during file upload or DB operation:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
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
