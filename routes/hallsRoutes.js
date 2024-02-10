import Express from 'express';
import { HallsController } from '../controller/hallsControllers.js';

const router = Express.Router();

// Route to get all rooms
router.get('/all', HallsController.getRooms);

// Route to create a new room
router.post('/create-room', HallsController.createRoom);

// Route to book a room by room ID
router.post('/booking/create/:id', HallsController.bookRooms);

// Route to get all booked rooms
router.get('/booked-rooms', HallsController.bookedRooms);

// Route to get all customers with their booked rooms
router.get('/customers-booked', HallsController.listCustomers);

// Route to get all bookings for a specific customer
router.get('/customers/booked-times', HallsController.listCustomerBookings);

export default router;
