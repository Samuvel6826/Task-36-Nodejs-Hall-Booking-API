import express from 'express';
import hallsRoute from './routes/hallsRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Route for handling requests related to rooms
app.use('/rooms', hallsRoute);

// Default route to welcome message
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Express</h1>');
});

// Start the server
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
