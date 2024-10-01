// multerConfig.ts
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AllowedFileTypes = string[];

const dynamicMulter = (
  folderName: string,
  allowedFileTypes: AllowedFileTypes = [],
  maxSizeInMB: number = 2048
) => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadPath = path.join(__dirname, `../uploads/${folderName}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const originalName = path.parse(file.originalname).name; // Extract the original file name without extension
      const ext = path.extname(file.originalname); // Get the file extension
      const timestamp = Date.now(); // Current timestamp
      const uniqueSuffix = `${originalName}-${timestamp}${ext}`; // Combine to create a unique filename
      cb(null, uniqueSuffix); // Pass the unique filename to the callback
    }
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.length && !allowedFileTypes.includes(ext)) {
      return cb(new Error('File type not allowed'));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: maxSizeInMB * 1024 * 1024 },
    fileFilter,
  });
};

export default dynamicMulter;
