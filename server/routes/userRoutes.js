// server/routes/userRoutes.js

import express from 'express';
import { createUser, getUsers, removeUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Add route for adding users
router.post('/users', createUser);

// Add route for fetching users
router.get('/users', getUsers);

//update user 
router.put('/users/:user_id', updateUser );


// delete user route
router.delete('/users/:user_id', removeUser);


export default router;