const multer = require("multer");
const path = require("path");
const moment = require("moment"); 

const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, "uploads/profile/");
    } else if (file.fieldname === "category_image") {
      cb(null, "uploads/categories/");
    } else if (file.fieldname === "product_image") {
      cb(null, "uploads/products/");
    } 
  },
  filename: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Invalid File type!"));
    }
    const ext = path.extname(file.originalname); 
    // cb(null, Date.now() + ext); // constructs the new filename by appending the current timestamp to the file extension, ensuring a unique filename
    cb(null, `image-${Date.now()}${ext}`); 

    // using moment (timestamp)
    // const timestamp=moment().format('YYYYMMDDHHmmss');
    // const ext=path.extname(file.originalname);
    // cb(null,`image-${timestamp}${ext}`)
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (file.size > 5 * 1024 * 1024) {
      return cb(new Error("File size exceeds 5MB"));
    }
    cb(null, true); 
  },
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 10, 
    fields: Infinity, 
  },
});

module.exports = upload;