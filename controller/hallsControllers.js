import moment from 'moment';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDataFolderPath = path.join(__dirname, '..', 'sampleDatas');

// Load data from JSON file
const loadDataFromJson = async (fileName) => {
  try {
    const filePath = path.join(sampleDataFolderPath, `${fileName}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${fileName}.json:`, error);
    throw error;
  }
};

// Write data to JSON file
const writeDataToJson = async (fileName, data) => {
  try {
    const filePath = path.join(sampleDataFolderPath, `${fileName}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing data to ${fileName}.json:`, error);
    throw error;
  }
};

let roomsDatas = [];
let bookingDatas = [];

// Initialize data
const initData = async () => {
  try {
    roomsDatas = await loadDataFromJson('roomsDatas');
    bookingDatas = await loadDataFromJson('bookings');
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};

initData().catch(err => console.error(err));

// Get all rooms
const getRooms = async (req, res) => {
  try {
    res.status(200).json({ roomsDatas });
  } catch (error) {
    console.error("Error getting rooms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 1. Creating a Room.
const createRoom = async (req, res) => {
  try {
    const newRoom = req.body;

    if (typeof newRoom !== 'object' || Array.isArray(newRoom)) {
      return res.status(400).json({ message: "Invalid room data format. Expected an object." });
    }

    const idExists = roomsDatas.find((room) => room.roomID === newRoom.roomID);
    if (idExists !== undefined) {
      return res.status(400).json({ message: "Room with the same ID already exists." });
    }

    roomsDatas.push(newRoom);

    await writeDataToJson('roomsDatas', roomsDatas);

    res.status(201).json({ message: "Room created successfully", newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Booking a Room.
const bookRooms = async (req, res) => {
  try {
    const id = req.query.roomID;
    const { customerName, startTime, endTime } = req.body;
    const bookingDate = moment().format('MMMM Do YYYY');

    const room = roomsDatas.find((room) => room.roomID === id);
    if (!room) {
      return res.status(400).json({ message: "Room does not exist.", RoomsList: roomsDatas });
    }

    // Check if the customer already exists
    let customer = bookingDatas.find((booking) => booking.customerName === customerName);
    if (!customer) {
      // If the customer doesn't exist, generate a new customer ID
      const customerID = "C" + (bookingDatas.length + 1);
      customer = { customerID, customerName };
    }

    const isRoomBooked = bookingDatas.some((booking) => {
      return booking.roomID === id && booking.status === "booked";
    });

    if (isRoomBooked) {
      return res.status(400).json({ message: "Room is already booked." });
    }

    const bookingID = "B" + (bookingDatas.length + 1); // Generate a unique booking ID

    const newBooking = {
      bookingID,
      roomID: id,
      customerID: customer.customerID, // Use the customer ID generated or found
      customerName,
      date: bookingDate,
      startTime,
      endTime,
      status: "booked"
    };

    bookingDatas.push(newBooking);

    // Write updated bookings data to JSON file
    await writeDataToJson('bookings', bookingDatas);

    return res.status(201).json({ message: "Hall booked successfully", bookingDetails: newBooking });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. List all Rooms with Booked Data
const bookedRooms = async (req, res) => {
  try {
    const listAllBookedRooms = bookingDatas.map((booking) => {
      const room = roomsDatas.find((room) => room.roomID === booking.roomID);
      if (room) {
        return {
          roomName: room.roomName,
          bookingStatus: booking.status,
          customerName: booking.customerName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime
        };
      }
      return null;
    }).filter(Boolean);

    res.status(200).json({ listAllBookedRooms });
  } catch (error) {
    console.error("Error listing rooms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. List all customers with booked Data.
const listCustomers = async (req, res) => {
  try {
    const listCustomers = bookingDatas.map((booking) => {
      const room = roomsDatas.find((room) => room.roomID === booking.roomID);
      if (room) {
        return {
          customerName: booking.customerName,
          roomName: room.roomName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime
        };
      }
      return null;
    }).filter(Boolean);

    res.status(200).json({ listCustomers });
  } catch (error) {
    console.error("Error listing customers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 5. List how many times a customer has booked the room.
const listCustomerBookings = (req, res) => {
  try {
    const customerId = req.query.customerID;

    const customerBookingsData = bookingDatas.filter((booking) => booking.customerID === customerId);

    const listCustomerBookings = customerBookingsData.map((booking) => {
      const { roomID, customerName, date, startTime, endTime, bookingID, status } = booking;
      const room = roomsDatas.find((room) => room.roomID === roomID);
      const roomName = room ? room.roomName : 'Unknown Room';

      return {
        customerID: customerId,
        customerName,
        roomName,
        date,
        startTime,
        endTime,
        bookingID,
        status
      };
    });

    const totalCount = customerBookingsData.length;

    res.status(200).json({ totalBookingsCount: totalCount, listCustomerBookings });
  } catch (error) {
    console.error("Error listing customer bookings:", error);
    res.status(400).json({ message: "Error listing customer bookings", error: error });
  }
};

export const HallsController = {
  getRooms,
  createRoom,
  bookRooms,
  bookedRooms,
  listCustomers,
  listCustomerBookings
};
