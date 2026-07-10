import express from 'express';
import { getSidebarMenus , getRolePermissions , getAllRoles , getRoleMenuPermissions , saveRolePermissions} from '../controllers/dynamicSidebarController.js';

const router = express.Router();

router.get('/sidebar', getSidebarMenus);
router.get('/getRolePermissions/:role', getRolePermissions);
router.get('/getAllRoles', getAllRoles);
router.get('/getRoleMenuPermissions/:role', getRoleMenuPermissions);
router.post('/saveRolePermissions', saveRolePermissions);

export default router;
