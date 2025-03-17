const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in RAM

const upload = multer({ storage: storage });

module.exports = upload;
