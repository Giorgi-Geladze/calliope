const express = require("express")
const route = express.Router()
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const calliopeSchema = require("../models/calliopeSchema")
const fs = require('fs');
const path = require('path');
route.use(bodyparser.json())



async function addProduct(req, res) {
    try {
        const { name, price, oldPrice, category, description } = req.body;
        const response = new calliopeSchema({
            name, price, oldPrice, category, description,
            imageURL: req.file ? req.file.filename : "",
            popularity: 0,
            rating: 5,
            date: new Date().toISOString().split("T")[0]
        })
        
        await response.save()

        res.status(201).json({
            message: "datat is succesfuly saved",
            data: response
        })

    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message: "failed adding data",
        })
    }
}

async function getAll(req, res) {
    try {
        const response = await calliopeSchema.find()

        res.status(200).json({
            message: "data is succesfuly collected and sended to frontEnd",
            data: response
        })
        
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            message: "failed getting data and sending to fronEnd"
        })
    }
}

async function deleteProduct(req, res) {
    try {
        const data = await req.params.id;
        const product = await calliopeSchema.findById(data)
        const imagePath = path.join(__dirname, "../../frontend/img/", product.imageURL)
        const response = await calliopeSchema.findByIdAndDelete(data)
        if (product.imageURL){
            fs.unlink(imagePath, (err)=>{
                if (err) {
                    console.log("not deleted:", err);
                } else {
                    console.log("deleted");
                }
            })
        }

        if (!response) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(204).json({
            message: "data is succesfuly deleted",
            data: response
        })

    } catch (error) {
        console.log(error);
    
        res.status(500).json({
            message: "failed deleting data"
        })
    }
}


module.exports = {addProduct, getAll, deleteProduct}