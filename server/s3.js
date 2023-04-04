const helper = require("./helper");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const randomFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

// S3 Confg
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

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

async function insertFileToS3(file) {
  // File backend validation (in case client side bypassed)
  const fileSizeInBytes = file.size;
  const fileSizeInKB = helper.bytesToKB(fileSizeInBytes);
  const maxfileSizeInKB = 50000; // = 50 MB
  const allowedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
  const filePath = file.originalname;
  const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

  if (!file.title || !file.buffer || fileSizeInKB > maxfileSizeInKB || !allowedExtensions.includes(extension)) {
    throw new Error("File received in s3.js is unacceptable ..");
  }

  // Inserting to S3 Bucket
  const fileName = randomFileName() + extension;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  const result = await s3.send(command);

  if (result.$metadata.httpStatusCode === 200) {
    console.log("File submitted successfully!");

    const post = {
      title: file.title,
      fileName: fileName,
      filePath: `https://s3.amazonaws.com/${bucketName}/${fileName}`,
      fileType: extension,
      fileSizeInKB: helper.bytesToKB(file.size),
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

// Get file from S3
async function getFileFromS3(s3FileName) {
  const params = {
    Bucket: bucketName,
    Key: s3FileName,
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

// Delete file from S3
async function deleteFileFromS3(s3FileName) {
  const params = {
    Bucket: bucketName,
    Key: s3FileName,
  };

  const command = new DeleteObjectCommand(params);
  const result = await s3.send(command);

  console.log("HERE IS THE RESULT OF DELETE FILE IN DELTEFILEFROMS3():");
  console.log(result);

  if (result.$metadata.httpStatusCode === 204) {
    // AWS S3 uses 204 status code for successful file delete
    console.log("File deleted successfully!");
    return true;
  } else {
    console.log("Error deleting file ..");
    console.log(result);
    return false;
  }
}

module.exports = { insertFileToS3, getFileFromS3, deleteFileFromS3 };
