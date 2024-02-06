import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to your sample data folder
const sampleDataFolderPath = path.join(__dirname, '..', 'sampleDatas');

// Function to load data from a JSON file
const loadDataFromJson = (fileName) => {
  const filePath = path.join(sampleDataFolderPath, `${fileName}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${fileName}.json: ${error.message}`);
    return null; // Return null in case of failure
  }
};

// Controller logic to get users data
export const UserController = {
  getUsers: (req, res) => {
    // Load data from JSON files
    const createRoom = loadDataFromJson('createRoom');
    const bookRoom = loadDataFromJson('bookRoom');
    const roomsBookedData = loadDataFromJson('roomsBookedData');
    const customersBookedData = loadDataFromJson('customersBookedData');
    const customerBookedTimes = loadDataFromJson('customerBookedTimes');
    
    // Log loaded data
    console.log('Data:', { createRoom, bookRoom, roomsBookedData, customersBookedData, customerBookedTimes });
    
    // Send response with loaded data
    res.send({ createRoom, bookRoom, roomsBookedData, customersBookedData, customerBookedTimes });
  }
};
