const multer = require("multer");

const storage = multer.memoryStorage(); // or diskStorage if you prefer
const upload = multer({ storage });

module.exports = upload;
