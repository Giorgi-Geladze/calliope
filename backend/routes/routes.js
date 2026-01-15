const controllers = require("../controllers/calliopeControllers")
const express = require("express")
const router = express.Router()
// ! multer
const multer = require('multer');
const path = require("path")

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

router.post("/", upload.single("image"), controllers.addProduct)
router.get("/", controllers.getAll)
router.delete("/:id", controllers.deleteProduct)


module.exports = router