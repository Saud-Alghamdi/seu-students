const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const randomFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

// S3 Confg
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

bucketName = process.env.BUCKET_NAME;
bucketRegion = process.env.BUCKET_REGION;
accessKey = process.env.ACCESS_KEY;
secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

async function insertFileToS3(req) {
  // Check if there is a title present
  if (!req.body.title) {
    return { err: "يجب كتابة عنوان." };
  }

  // Check if there is a file submitted
  if (!req.file) {
    return { err: "يجب اختيار ملف." };
  }

  // File type validation
  const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
  const filePath = req.file.originalname;
  const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return { err: "Invalid file type. Only PDF, Word, and PowerPoint files are allowed." };
  }

  // Inserting to S3 Bucket
  const fileName = randomFileName() + extension;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  const result = await s3.send(command);

  if (result.$metadata.httpStatusCode === 200) {
    console.log("File submitted successfully!");

    const post = {
      title: req.body.title,
      fileName: fileName,
      filePath: `https://s3.amazonaws.com/${bucketName}/${fileName}`,
      fileType: extension,
      fileSize: req.file.size,
    };

    console.log(post);

    return {
      success: true,
      result,
      post,
    };
  } else {
    console.log("Error submitting file");
    return {
      err: true,
      result,
    };
  }
}

async function getFileFromS3(req) {
  const params = {
    Bucket: bucketName,
    Key: req.query.s3FileName,
  };

  const command = new GetObjectCommand(params);
  const file = await s3.send(command);

  if (file.$metadata.httpStatusCode === 200) {
    console.log("File retreived successfully!");
    return {
      success: true,
      file,
    };
  } else {
    console.log("Error retreiving file ..");
    return {
      err: true,
      file,
    };
  }
}

module.exports = { insertFileToS3, getFileFromS3 };
