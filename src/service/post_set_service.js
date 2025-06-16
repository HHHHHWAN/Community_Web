const { read_DB , write_DB  } = require('../models/mysql_connect');
const read_DB_promise = read_DB.promise();
const data_utils = require('../utils/dataUtils');

const path = require('path');
const Crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp');

const post_set_service = {

    //새 게시물 insert 쿼리
    add_content: (title, text, content_type , user_id , callback) => {

        const xss_check_title = data_utils.XSS_check_string(title);
        const xss_check_text = data_utils.XSS_check_string(text);

        const query = `INSERT INTO Content (title, text, content_type , user_id ) VALUES (?, ?, ?, ?)`;

        write_DB.query(query, [ xss_check_title, xss_check_text, content_type, user_id ], (err, result) => {
            if (err) {
                console.error( "(add_content) mysql2 : ", err.stack);

                return callback(500, null);
            }

            const newContentId = result.insertId;
            
            callback(null, newContentId);
        });
    },
    
    // 게시물 수정 
    put_content: (title, text , content_id, category, request_user_id, callback ) => {

        const xss_check_title = data_utils.XSS_check_string(title);
        const xss_check_text = data_utils.XSS_check_string(text);

        const query = `UPDATE Content SET title = ?, text = ?, content_type = ?  WHERE id = ? AND user_id = ? AND visible = 1`;

        write_DB.query(query,[ xss_check_title, xss_check_text, category, content_id, request_user_id],(err, result) => {
            if (err){
                console.error( "(put_content) mysql2 : ", err.stack);
                return callback(500, "서버에서 요청을 처리하지 못했습니다.");
            }

            if(!result.affectedRows){
                return callback(403, "요청 권한이 존재하지 않습니다.");
            }

            callback(null, "게시물 수정을 성공했습니다.");
        });
    },

    // 새 댓글 생성
    add_comment: ( comment_text, user_id , content_id , parent_id, callback) => {

        const xss_check_comment = data_utils.XSS_check_string(comment_text);

        const query = `INSERT INTO Comment (comment, user_id, content_id, parent_id ) VALUES (?, ?, ?, ?)`;
        write_DB.query(query, [ xss_check_comment, user_id , content_id, parent_id ] , (err) => {
            if(err){
                console.error(" ( add_comment ) MySql2 : ", err.stack);

                return callback(500);
            }

            callback(null);
        });
    },
    
    // 댓글 수정
    put_comment: ( comment_text, comment_id , request_user_id , callback) => {

        const xss_check_comment = data_utils.XSS_check_string(comment_text);

        const query = `UPDATE Comment SET comment = ? WHERE id = ? AND user_id = ? AND visible = 1 `;

        write_DB.query(query, [ xss_check_comment, comment_id , request_user_id ] , (err, result) => {

            if (err){
                console.error( "(put_comment) mysql2 : ", err.stack);
                return callback(500, "서버에서 요청을 처리하지 못했습니다.");
            }

            if(!result.affectedRows){
                return callback(403, "요청 권한이 존재하지 않습니다.");
            }

            callback(null, "댓글 수정을 성공했습니다.");
        });
    },

    // 게시글 비활성화
    set_invisibly_content : (content_id, user_id, callback) =>{
        const query = `UPDATE Content SET visible = b'0', delete_at = ?  WHERE id = ? AND user_id = ?`;
        write_DB.query(query, [new Date, content_id , user_id] , (err, result) => {
            if(err){
                return callback(err,null);
            }
            callback(null,result);
        });
    },

    // 댓글 비활성화
    set_invisibly_comment : (comment_id, user_id, callback) => {
        const query = `UPDATE Comment SET visible = b'0', delete_at = ?  WHERE id = ? AND user_id = ?`;
        write_DB.query(query, [new Date, comment_id , user_id] , (err, result) => {
            if(err){
                return callback(err,null);
            }

            callback(null,result);
        });
    },

    /** 파일 업로드  */
    set_file_list : async (req, callback) => {
        const query_select = `SELECT * FROM File WHERE hash = ?`;
        const filePath = req.file.path;

        try{
            // 파일 내용 전체를 읽어와 바이트 단위로 해시 생성
            const fileBuffer = fs.readFileSync(filePath);
            const fileHash = Crypto.createHash('sha256').update(fileBuffer).digest('hex');

            const [DB_row] = await read_DB_promise.query(query_select,[fileHash]);

            // DUP
            if (DB_row.length > 0){
                // 이미 업로드 된 파일 사용
                const imageInfo = DB_row[0];
                return callback(null, imageInfo.path);
            }

            
            const fileName = `${fileHash}.webp`;
            const uploadPath = path.join(process.cwd(), '/public/upload', fileName);
            const staticPath = `/upload/${fileName}`;
            
            await sharp(fileBuffer)
                .toFormat('webp', { quality: 80})
                .toFile(uploadPath);

            const file_value = {
                path : staticPath,
                name : req.file.originalname,
                hash : fileHash,
                user_id : req.session.user.user_id
            }

            await read_DB_promise.query('INSERT INTO File SET ?', file_value);

            callback(null, staticPath);
        }catch(err){
            callback(500, null)
        }finally{
            fs.unlinkSync(filePath);
        }
    }
};


module.exports = post_set_service;