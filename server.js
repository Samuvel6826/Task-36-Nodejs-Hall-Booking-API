import Express  from 'express'
import UserRoute from './routes/hallsRoutes.js'

const app = Express()
const PORT = process.env.PORT || 8000;

app.use('/users',UserRoute)

app.get('/', (req,res)=> {
    res.send('<h1>Welcome to Express</h1>')
})

app.listen(PORT, ()=>console.log(`App is running in port ${PORT}`))