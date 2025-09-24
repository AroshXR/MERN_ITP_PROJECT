const multer = require("multer");  // Replaced import with require

const upload = multer({ storage: multer.diskStorage({}) });

module.exports = upload;  // Replaced export default with module.exports
