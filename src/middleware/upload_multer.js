//  upload_multer.js
//  Create file upload process middleware object
const multer = require('multer');
const path = require('path');
const Crypto = require('crypto');

const setting = multer.diskStorage({
    destination : ( req, file, callback ) => {
        const upload_path = path.join(process.cwd(),'./public/upload');
        callback(null, upload_path);
    },
    filename : ( req, file, callback ) => {
        const random_name = Crypto.randomBytes(20).toString('hex');
        const mimetype = file.mimetype;
        const file_name = `${Date.now()}_${random_name}${mimetype.replace('image/','.')}`;
        callback(null, file_name);
    }
});

const upload = multer({
    storage : setting,
    limits : { fileSize : 5 * 1024 * 1024 },
    fileFilter: ( req, file, callback ) => {
        const allowedTypes = ['image/jpeg', 'image/gif', 'image/png'];
        if(allowedTypes.includes(file.mimetype)){
            return callback(null, true);
        }
        callback(new Error('허용되지 않는 파일 형식입니다.'),false);
    },
});





module.exports = upload;