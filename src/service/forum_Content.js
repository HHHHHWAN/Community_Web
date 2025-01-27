// models/forum_Content ( contents_db )
const { read_DB , write_DB  } = require('../models/mysql_connect');
const data_utils = require('../utils/dataUtils');
const data_recreate = require('../utils/re_structure');

// view count    
async function detail_add_viewcount(content_id){
    const query = `update Content set view_count = view_count + 1 where id = ?`;
    write_DB.query(query, [content_id], (err) => {
        if (err) {
            console.log(`Content id : ${content_id}`);
            console.error("( detail_add_viewcount ) View Count Error : ", set_view.err);
        }
    });
}

// XSS check
function detail_check_textbox(text){
    const { JSDOM } = require('jsdom');
    const DOMPurify = require('dompurify');
    const window_object = new JSDOM('').window;
    const objectDOMPurify = DOMPurify(window_object);

    if(text){
        const check_text = objectDOMPurify.sanitize(text);
        return check_text;
    }
}





const Content = {
    // main_page_listView
    get_mainpage_contents : ( callback ) => {
        const query = ` 
            (select A.*, User.nickname from (select * from Content where content_type = 'qa' and visible = 1  order by date_create desc limit 5) A left join User on A.user_id = User.id)
            union all
            (select A.*, User.nickname from (select * from Content where content_type = 'life' and visible = 1  order by date_create desc limit 5)  A left join User on A.user_id = User.id) 
            union all
            (select A.*, User.nickname from (select * from Content where content_type = 'info' and visible = 1  order by date_create desc limit 5) A left join User on A.user_id = User.id) 
        `;
        read_DB.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }

            results.forEach(row => {
                row.date_create = data_utils.date_before(row.date_create);
            });

            return callback(null, results);
        });

    },

    // 인기페이지 쿼리 
    get_popular_contents: (limit, offset, order_type, callback) => {

        //popular content list 
        var order_column = 'date_create';
        var order_rule = 'DESC';

        switch(order_type){
            case "oldest_order" :
                order_rule = 'ASC';
                break;
            case "view_count_order" :
                order_column = 'view_count';
                break;
            case "comment_count_order" : 
                order_column = 'comment_count';
                break;
            default :
        }

        const query = `
        select A.*, User.nickname from (
        select * from Content left join (
        select content_id, count(*) as comment_count from Comment group by content_id ) B on Content.id = B.content_id 
        where view_count > 3 and visible = 1  order by ${order_column} ${order_rule}, date_create DESC limit ? offset ? ) A 
        left join User on User.id = A.user_id; 
        `; 

        const query_count = `select count(*) as popular_count from Content where view_count > 3 and visible = 1  order by date_create desc`; 
        // view_count 3 초과 레코드 출력

        read_DB.query(query, [limit, offset], (err, results) => {
            
            if (err) {
                return callback(err, null);
            }

            results.forEach( row => {
                row.date_create = data_utils.date_before(row.date_create);
            });
            
            read_DB.query(query_count, (err, results_2) => {
                if (err){
                    return callback(err, null);
                }

                callback(err, results, results_2[0]);
            });
        });
    },

    // 카테고리 게시판 페이지 리스트 호출
    get_type: (pagetype, offset, order_type, callback) => {

        var order_column = 'date_create';
        var order_rule = 'DESC';

        switch(order_type){
            case "oldest_order" :
                order_rule = 'ASC';
                break;
            case "view_count_order" :
                order_column = 'view_count';
                break;
            case "comment_count_order" : 
                order_column = 'comment_count';
                break;
            default :
        }

        const query = `
        select A.*, User.nickname from (
        select * from Content left join (
        select content_id, count(*) as comment_count from Comment group by content_id ) B on Content.id = B.content_id 
        where content_type = ? and visible = 1  order by ${order_column} ${order_rule}, date_create DESC limit 10 offset ? ) A 
        left join User on User.id = A.user_id; 
        `; 

        read_DB.query(query, [pagetype, offset], (err, results) => {
            
            if (err) {
                return callback(err, null);
            }

            results.forEach( row => {
                row.date_create = data_utils.date_before(row.date_create);
            });

            return callback(null, results);
        });
    },
    
    // 게시물 내용 GET
    get_record: async (Content_id, view_history, request_type , callback) => {
        const query = `select A.*, User.nickname from (select * from Content where id = ? and visible = 1) A left join User on User.id = A.user_id`;
        read_DB.query(query, [Content_id], (err, results) => {
            if (err) {
                return callback(err, null, null);
            }

            const content_record = results[0];

            if( request_type === "view" && results.length){
                // view count 1 add
                if(!view_history.some(view_post => view_post === Content_id)){
                    view_history.push(Content_id);
                    detail_add_viewcount(Content_id);
                }
                // 날짜 정보 가공
                results.date_create = data_utils.date_before(content_record.date_create);

                return callback(null, content_record, view_history); // 배열이 아닌 인덱스 0으로 반환
            }

            callback(null, content_record, null); // 배열이 아닌 인덱스 0으로 반환
        });
    },

    // 댓글 리스트 GET
    get_comment_list: ( content_id, callback ) => {
        const query = `select A.*, User.nickname from ( select * from Comment where content_id = ? ) A left join User on A.user_id = User.id`;

        read_DB.query(query, [content_id], ( err, comment_results ) => {
            if (err){
                console.log("( get_comment_list ) error : " , err);
                return callback (null);
            }

            const comment_count = comment_results.length;

            // 날짜 가공
            comment_results.forEach( row => {
                row.create_at = data_utils.date_before(row.create_at);
            });

            // 노출 체크
            comment_results = data_utils.change_delete_comment_text(comment_results);

            // 종속 트리 생성 ( 대댓글 )
            comment_results = data_recreate.comment_structure(comment_results);

            callback({Count : comment_count , Comments: comment_results});
        });

    },

    // 게시물 개수 체크
    get_page_count: (pagetype, callback ) =>{
        const query = `select count(*) as total_count from Content where content_type = ? and visible = 1 `;
        // count 함수 사용으로 컬럼 명 정의 필요, alias 활용
        
        read_DB.query(query,[pagetype], (err, [results]) => {
            const count = Math.ceil(results.total_count / 10 ); // 소수점 반올림 

            callback(null,count); // 배열이 아닌 단일 값으로 반환**
        });
    },



    //새 게시물 insert 쿼리
    create_content: (title, text, content_type , user_id , callback) => {

        // XSS 

        const xss_check_title = detail_check_textbox(title);
        const xss_check_text = detail_check_textbox(text);
        const query = `insert into Content (title, text, content_type , user_id ) values (?, ?, ?, ?)`;

        write_DB.query(query, [xss_check_title, xss_check_text, content_type , user_id ], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },
    
    //게시물 수정 
    re_create_content: (title, text , content_id , callback ) => {
        const query = `update Content set title = ?, text = ? where id = ? `;
        write_DB.query(query,[ title, text ,content_id ],(err) => {
            if (err){
                return callback(err);
            }

            callback(null);
        });
    },

    create_comment: ( comment_text, user_id , content_id , comment_id, callback) => {
        const query = `insert into Comment (comment, user_id, content_id, parent_id ) values (?, ?, ?, ?)`;
        write_DB.query(query, [ comment_text, user_id , content_id, comment_id ] , (err) => {
            callback(err);
        });
    },
    
    re_create_comment: ( comment_text, comment_id , user_id , callback) => {
        const query = `update Comment set comment = ? where id = ? AND user_id = ? `;
        write_DB.query(query, [ comment_text, comment_id , user_id ] , (err, result) => {
            callback(err,result);
        });
    },

    set_invisibly_content : (content_id, user_id, callback) =>{
        const query = `update Content set visible = b'0', date_delete = ?  where id = ? and user_id = ?`;
        write_DB.query(query, [new Date, content_id , user_id] , (err, result) => {
            if(err){
                return callback(err,null);
            }
            callback(null,result);
        });
    },

    set_invisibly_comment : (comment_id, user_id, callback) => {
        const query = `update Comment set visible = b'0', delete_at = ?  where id = ? and user_id = ?`;
        write_DB.query(query, [new Date, comment_id , user_id] , (err, result) => {
            if(err){
                return callback(err,null);
            }
            callback(null,result);
        });
    },

    get_search_post :  async (search_text, top_page, bottom_page, callback) => { 
        const query_contents = `select * from Content where ( title like ? or text like ? ) and visible = 1 limit 5 offset ?`;
        const query_comments = `select A.*, Content.content_type as content_type, Content.title as content_title from ( select * from Comment where comment like ? and visible = 1 limit 5 offset ?) A left join Content on Content.id = A.content_id`;

        // 통합 가능
        const query_contents_count = `select count(*) as count from Content where ( title like ? or text like ? ) and visible = 1`;
        const query_comments_count = `select count(*) as count from Comment where comment like ? and visible = 1`;

        const wild_text = `%${search_text}%`;
        const top_offset = (top_page - 1)* 5;
        const bottom_offset = (bottom_page - 1) * 5;

        // promise 형식으로 반환
        const read_DB_promise = read_DB.promise();

        try{
            const [ result_contents ]  = await read_DB_promise.query(query_contents,[wild_text, wild_text, top_offset]);
            const [ result_comments ]  = await read_DB_promise.query(query_comments,[wild_text, bottom_offset]);

            const [result_contents_count]  = await read_DB_promise.query(query_contents_count,[wild_text, wild_text]);
            const [result_comments_count]  = await read_DB_promise.query(query_comments_count,[wild_text]);

            const contents_page = Math.ceil(result_contents_count[0].count / 5);
            const comments_page = Math.ceil(result_comments_count[0].count / 5);
            result_contents_count[0].page = contents_page;
            result_comments_count[0].page = comments_page;

            callback(null, {
                    Contents_list : result_contents,
                    Comments_list : result_comments,
                    Content_total : result_contents_count[0],
                    Comment_total : result_comments_count[0]
                }
            );

        }catch(err){ // query 함수 err 캐치
            console.log(" ( get_search_post ) query Error : ", err);
            return callback(err, null);
        }
    }
};

module.exports = Content;