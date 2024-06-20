const multer=require('multer') // Muter for file uploads
const {v4:uuidv4}=require('uuid') // uuid for getting unique names
const path=require('path') //for working with paths


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Setting the destination directory where uploaded files will be stored
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    // Generating a unique filename for each uploaded file
    const uniquename = uuidv4()
    // getting the extension of the uploaded file
    cb(null, uniquename + path.extname(file.originalname))
  },
})

// Creating a multer instance with the configured storage
const upload = multer({ storage: storage })

module.exports=upload