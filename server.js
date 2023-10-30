import express from "express"
import cors from "cors"
import morgan from "morgan"
import connect  from "./database/conn.js"
import router from "./router/route.js"

const app = express()


// middlewares
app.use(express.json())
app.use(cors())
app.use(morgan("tiny"))
app.disable('x-powered-by')    //less hackers know about your stack


const PORT = 8000;

// HTTP GET REQUEST //
app.get('/', (req, res) =>{
    res.status(201).json("Home get request")
})


// router
app.use('/api', router)


//Start server  when we have a valid connection

connect().then(() => {
    try {
        app.listen(PORT, () => {
            console.log(`Server connected to http://localhost:${PORT}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})

