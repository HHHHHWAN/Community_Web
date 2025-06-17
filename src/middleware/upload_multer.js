//  upload_multer.js
//  Create file upload process middleware object
const multer = require('multer');
const path = require('path');
const upload_path = path.join(process.cwd(),'./public/upload');

const setting = multer.diskStorage({
    destination : ( req, file, callback ) => {
        callback(null, upload_path);
    },
    filename : ( req, file, callback ) => {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        callback(null, decodedName);
    }
});

const upload = multer({
    storage: setting,
    limits : { fileSize : 5 * 1024 * 1024 },
    fileFilter: ( req, file, callback ) => {
        const allowedTypes = ['image/jpeg', 'image/gif', 'image/png'];
        if(allowedTypes.includes(file.mimetype)){
            return callback(null, true);
        }
        callback(new Error('허용되지 않는 파일 형식입니다.'), false);
    },
});

module.exports = upload;