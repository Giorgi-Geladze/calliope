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
        const id = req.params.id;
        const product = await calliopeSchema.findById(id);

        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }

        const response = await calliopeSchema.findByIdAndDelete(id);

        if (product.imageURL) {
            const imagePath = path.join(__dirname, "../public/img/", product.imageURL);
            
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.log("doesn't deleted:", err);
                    else console.log("has been deleted");
                });
            } else {
                console.log("these is no data, just deleted from db.");
            }
        }

        res.status(200).json({ 
            message: "img is deleted",
            data: response
        });

    } catch (error) {
        console.log("deleting error:", error);
        res.status(500).json({ message: "server error on deleting" });
    }
}

module.exports = {addProduct, getAll, deleteProduct}