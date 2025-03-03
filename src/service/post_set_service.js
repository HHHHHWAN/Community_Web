const { read_DB , write_DB  } = require('../models/mysql_connect');


// XSS 체크, 변환
function XSS_check_string(text){
    const { JSDOM } = require('jsdom');
    const DOMPurify = require('dompurify');
    const window_object = new JSDOM('').window;
    const objectDOMPurify = DOMPurify(window_object);

    if(text){
        const check_text = objectDOMPurify.sanitize(text);
        return check_text;
    }
}


const post_set_service = {

    //새 게시물 insert 쿼리
    add_content: (title, text, content_type , user_id , callback) => {

        const xss_check_title = XSS_check_string(title);
        const xss_check_text = XSS_check_string(text);

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

        const xss_check_title = XSS_check_string(title);
        const xss_check_text = XSS_check_string(text);

        const query = `UPDATE Content SET title = ?, text = ?, content_type = ?  WHERE id = ? AND user_id = ? AND visivle = 1`;

        write_DB.query(query,[ xss_check_title, xss_check_text, category, content_id, request_user_id],(err, result) => {
            if (err){
                console.error( "(add_content) mysql2 : ", err.stack);
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

        const xss_check_comment = XSS_check_string(comment_text);

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

        const xss_check_comment = XSS_check_string(comment_text);

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
        const query = `UPDATE Content SET visible = b'0', date_delete = ?  WHERE id = ? AND user_id = ?`;
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

};


module.exports = post_set_service;