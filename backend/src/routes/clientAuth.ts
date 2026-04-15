import { Router } from 'express';
import { clientAuthController } from '../controllers/clientAuthController.js';
import { clientLoginSchema, requestPasswordResetSchema, clientResetPasswordSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const validated = clientLoginSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await clientAuthController.me(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/request', async (req, res, next) => {
  try {
    const validated = requestPasswordResetSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.requestPasswordReset(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/confirm', async (req, res, next) => {
  try {
    const validated = clientResetPasswordSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

// Download file attachment (authenticated)
router.get('/files/:fileName', authMiddleware, async (req, res, next) => {
  try {
    const { fileName } = req.params;

    // Prevent path traversal - only allow generated filenames (hex + extension)
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }

    const { fileHandler } = await import('../utils/fileHandler.js');
    const filePath = fileHandler.getFilePath(fileName);
    res.download(filePath, fileName);
  } catch (error) {
    next(error);
  }
});

export default router;
