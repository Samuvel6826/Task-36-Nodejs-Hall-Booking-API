import express  from 'express'
import HallsRoute from './routes/hallsRoutes.js'

const app = express()
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use('/rooms',HallsRoute)

app.get('/', (req,res)=> {
    res.send('<h1>Welcome to Express</h1>')
})

app.listen(PORT, ()=>console.log(`App is running in port ${PORT}`))