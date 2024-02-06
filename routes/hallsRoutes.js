import Express from 'express';
import { UserController } from '../controller/hallsControllers.js';

const router = Express.Router();

// router.post('/createRoom', UserController.getUsers);
// router.post('/bookRoom', UserController.getUsers);
// router.get('/listRooms', UserController.getUsers);
// router.get('/listCustomers', UserController.getUsers);
router.get('/', UserController.getUsers);

export default router;
