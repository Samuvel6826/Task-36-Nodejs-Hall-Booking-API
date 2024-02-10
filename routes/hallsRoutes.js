import Express from 'express';
import { HallsController } from '../controller/hallsControllers.js';

const router = Express.Router();

router.get('/all', HallsController.getRooms);
router.post('/create-room', HallsController.createRoom);
router.post('/booking/create/:id', HallsController.bookRooms);
router.get('/booked-rooms', HallsController.bookedRooms);
router.get('/customers-booked', HallsController.listCustomers);
router.get('/customers/booked-times', HallsController.listCustomerBookings);

export default router;
