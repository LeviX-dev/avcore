// server/routes/userRoutes.js

import express from 'express';
import { createUser, getUsers, removeUser, updateUser
    ,sendResetOtp  , resetPassword ,  getUsersByRole ,
 } from '../controllers/userController.js';

const router = express.Router();

// Add route for adding users
router.post('/users', createUser);

// Add route for fetching users
router.get('/users', getUsers);

router.get('/users/by-role', getUsersByRole);


//update user 
router.put('/users/:user_id', updateUser );


// delete user route
router.delete('/users/:user_id', removeUser);


router.post('/users/send-reset-otp/:user_id', sendResetOtp);
router.post('/users/reset-password/:user_id', resetPassword);



export default router;