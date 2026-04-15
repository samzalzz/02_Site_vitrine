import multer from 'multer';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage(); // Keep in memory, we'll save manually

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  },
});
