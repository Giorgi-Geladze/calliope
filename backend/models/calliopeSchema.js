const mongoose = require("mongoose")
const {Schema} = mongoose

const CalliopeSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, require: true},
    oldPrice: {type: Number},
    category: {type: String, required: true},
    description: String,
    imageURL: String,
    popularity: {type: Number, default: 0},
    rating: {type:Number, default: 5},
    date: {type: String, default: ()=> new Date().toISOString().split("T")[0]}
})


const calliopeSchema = mongoose.model("calliopeProducts", CalliopeSchema)

module.exports = calliopeSchema;