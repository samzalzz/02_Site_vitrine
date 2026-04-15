import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const fileHandler = {
  saveFile(buffer: Buffer, originalName: string): { fileName: string; fileUrl: string } {
    // Generate unique filename with original extension
    const ext = path.extname(originalName);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    return {
      fileName,
      fileUrl: `/uploads/${fileName}`,
    };
  },

  deleteFile(fileName: string): void {
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  getFilePath(fileName: string): string {
    return path.join(UPLOAD_DIR, fileName);
  },
};
