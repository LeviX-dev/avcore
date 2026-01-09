// routes/authRoutes.js
import express from 'express';
import { signIn, checkSession ,logout, getUserRole , getUserName} from '../controllers/authController.js';

const router = express.Router();


router.get('/check-session', checkSession);

router.post('/signin', signIn);

router.post('/logout', logout);

router.get('/get-role', getUserRole);

router.get('/get-name', getUserName);


export default router;
