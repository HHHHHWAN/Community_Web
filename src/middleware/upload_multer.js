//  upload_multer.js
//  Create file upload process middleware object
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const upload_path = path.join(process.cwd(),'./public/upload');
        callback(null, upload_path);
    },

    filename : (req, file, callback) => {
        const file_name = `${Date.now()}_${file.originalname}`;
        callback(null, file_name);
    }
});

const upload = multer({storage});



module.exports = upload;