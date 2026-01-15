const controllers = require("../controllers/calliopeControllers")
const express = require("express")
const router = express.Router()
const ADMIN_KEY = process.env.ADMIN_PASSWORD
// ! multer
const multer = require('multer');
const path = require("path")


const checkAdmin = (req, res, next) => {
    const userPass = req.headers['admin-pass'];
    if (userPass === ADMIN_KEY) {
        next();
    } else {
        res.status(401).json({ error: "no admin!" });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/img/"))},
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file
            .originalname
        )
    }
})

const upload = multer({storage})

router.get("/", controllers.getAll); 
router.post("/", checkAdmin, upload.single("image"), controllers.addProduct); 
router.delete("/:id", checkAdmin, controllers.deleteProduct); 

module.exports = router