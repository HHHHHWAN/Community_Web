const { read_DB , write_DB  } = require('../models/mysql_connect');


// XSS check
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
                return callback(err, null);
            }
            callback(null, result);
        });
    },
    
    //게시물 수정 
    put_content: (title, text , content_id, category, callback ) => {

        const xss_check_title = XSS_check_string(title);
        const xss_check_text = XSS_check_string(text);

        const query = `UPDATE Content SET title = ?, text = ?, content_type = ?  WHERE id = ? `;

        write_DB.query(query,[ xss_check_title, xss_check_text, category, content_id ],(err) => {
            if (err){
                return callback(err);
            }

            callback(null);
        });
    },

    add_comment: ( comment_text, user_id , content_id , comment_id, callback) => {

        const xss_check_comment = XSS_check_string(comment_text);

        const query = `INSERT INTO Comment (comment, user_id, content_id, parent_id ) VALUES (?, ?, ?, ?)`;
        write_DB.query(query, [ xss_check_comment, user_id , content_id, comment_id ] , (err) => {
            callback(err);
        });
    },
    
    put_comment: ( comment_text, comment_id , user_id , callback) => {

        const xss_check_comment = XSS_check_string(comment_text);

        const query = `UPDATE Comment SET comment = ? WHERE id = ? AND user_id = ? `;

        write_DB.query(query, [ xss_check_comment, comment_id , user_id ] , (err, result) => {
            callback(err,result);
        });
    },

    set_invisibly_content : (content_id, user_id, callback) =>{
        const query = `UPDATE Content SET visible = b'0', date_delete = ?  WHERE id = ? AND user_id = ?`;
        write_DB.query(query, [new Date, content_id , user_id] , (err, result) => {
            if(err){
                return callback(err,null);
            }
            callback(null,result);
        });
    },

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