import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDataFolderPath = path.join(__dirname, '..', 'sampleDatas');

const loadDataFromJson = async (fileName) => {
  try {
    const filePath = path.join(sampleDataFolderPath, `${fileName}.json`);
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${fileName}.json:`, error);
    throw error;
  }
};

const writeDataToJson = async (fileName, data) => {
  try {
    const filePath = path.join(sampleDataFolderPath, `${fileName}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing data to ${fileName}.json:`, error);
    throw error;
  }
};

let roomsData = [];
let createBookingsData = [];

const initData = async () => {
  try {
    roomsData = await loadDataFromJson('roomsData');
    createBookingsData = await loadDataFromJson('bookings');
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};

initData().catch(err => console.error(err));

const getRooms = async (req, res) => {
  try {
    res.status(200).json({ roomsData });
  } catch (error) {
    console.error("Error getting rooms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createRoom = async (req, res) => {
  try {
    const newRoom = req.body;

    if (typeof newRoom !== 'object' || Array.isArray(newRoom)) {
      return res.status(400).json({ message: "Invalid room data format. Expected an object." });
    }

    const idExists = roomsData.find((room) => room.roomID === newRoom.roomID);
    if (idExists !== undefined) {
      return res.status(400).json({ message: "Room with the same ID already exists." });
    }

    roomsData.push(newRoom);

    await writeDataToJson('roomsData', roomsData);

    res.status(201).json({ message: "Room created successfully", newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const bookRooms = async (req, res) => {
  try {
    const id = req.query.roomID;
    const { customerName, startTime, endTime } = req.body;
    const bookingDate = moment().format('MMMM Do YYYY');

    const room = roomsData.find((room) => room.roomID === id);
    if (!room) {
      return res.status(400).json({ message: "Room does not exist.", RoomsList: roomsData });
    }

    // Check if the customer already exists
    let customer = createBookingsData.find((booking) => booking.customerName === customerName);
    if (!customer) {
      // If the customer doesn't exist, generate a new customer ID
      const customerID = "C" + (createBookingsData.length + 1);
      customer = { customerID, customerName };
    }

    const isRoomBooked = createBookingsData.some((booking) => {
      return booking.roomID === id && booking.status === "booked";
    });

    if (isRoomBooked) {
      return res.status(400).json({ message: "Room is already booked." });
    }

    const bookingID = "B" + (createBookingsData.length + 1); // Generate a unique booking ID

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

    createBookingsData.push(newBooking);

    // Write updated bookings data to JSON file
    await writeDataToJson('bookings', createBookingsData);

    return res.status(201).json({ message: "Hall booked successfully", bookingDetails: newBooking });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const bookedRooms = async (req, res) => {
  try {
    const roomBookings = createBookingsData.map((booking) => {
      const room = roomsData.find((room) => room.roomID === booking.roomID);
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

    res.status(200).json({ roomBookings });
  } catch (error) {
    console.error("Error listing rooms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const listCustomers = async (req, res) => {
  try {
    const customerBookings = createBookingsData.map((booking) => {
      const room = roomsData.find((room) => room.roomID === booking.roomID);
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

    res.status(200).json({ customerBookings });
  } catch (error) {
    console.error("Error listing customers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const listCustomerBookings = (req, res) => {
  try {
    const customerId = req.query.customerID; // Extract customer ID from request query parameters

    // Filter the bookings data for the specified customer ID
    const customerBookingsData = createBookingsData.filter((booking) => booking.customerID === customerId);

    // Map the filtered booking data to include only the required details
    const customerBookings = customerBookingsData.map((booking) => {
      const { roomID, date, startTime, endTime, bookingID, status } = booking;
      const room = roomsData.find((room) => room.roomID === roomID);
      const roomName = room ? room.roomName : 'Unknown Room';

      return {
        customerID: customerId,
        roomName,
        date,
        startTime,
        endTime,
        bookingID,
        status
      };
    });

    // Get the total count of customer bookings
    const totalCount = customerBookingsData.length;

    res.status(200).json({ totalBookings: totalCount, customerBookings });
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
