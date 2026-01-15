const mongoose = require("mongoose")
require("dotenv").config()


const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("database connected succesfuly");
        
    } catch (error) {
        console.log("database connection ERROR");
        process.exit(1)
        
    }
}

module.exports = connectDB;