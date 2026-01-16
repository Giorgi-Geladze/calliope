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
mongoDB()

app.use(cors({
    origin: "*", // Şimdilik her yerden gelen isteğe izin ver
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"], // Kullanılan tüm metodlar
    allowedHeaders: ["Content-Type", "admin-pass"], // Backend'in 'admin-pass' başlığını kabul etmesini sağlar
    credentials: true
}));
// app.use(cors());




app.use(express.json())
// app.use("/img", express.static(path.join(__dirname, "../frontend/img/")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/calliope", calliopeRoutes)

app.get(/^(?!\/calliope|\/img).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
    console.log(`everything is great!`)
})