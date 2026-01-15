const express = require("express")
const app = express()
const mongoDB = require("./config/config")
const calliopeRoutes = require("./routes/routes")
const cors = require("cors")
require("dotenv").config();
const port = process.env.PORT || 3000;
//! multer library
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        // cb(null, path.join(__dirname, "../frontend/img/"))
        cb(null, path.join(__dirname, "public/img/"))
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

// app.use(cors({
//     origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
// }))

app.use(cors());



mongoDB()

app.use(express.json())
// app.use("/img", express.static(path.join(__dirname, "../frontend/img/")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/calliope", calliopeRoutes)

app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
    console.log(`everything is great!`)
})