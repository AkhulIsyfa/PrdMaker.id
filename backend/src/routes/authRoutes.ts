import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { RegisterUserSchema, LoginUserSchema } from '../models/user.dto.js';
import { authenticateToken } from '../middlewares/auth.js';
import { issueCsrfToken } from '../middlewares/csrf.js';

const router = Router();

router.get('/csrf-token', issueCsrfToken);

router.post(
  '/register',
  validateRequest({ body: RegisterUserSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateRequest({ body: LoginUserSchema }),
  authController.login.bind(authController)
);

router.get(
  '/me',
  authenticateToken,
  authController.me.bind(authController)
);

router.post(
  '/logout',
  authController.logout.bind(authController)
);

export default router;

