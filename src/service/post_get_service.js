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
};

const post_get_service = {

    // main_page_listView
    get_mainpage_contents : ( callback ) => {
        const query = ` 
            ( SELECT POST.*, User.nickname FROM (
                SELECT * FROM (
                    SELECT * FROM Content WHERE content_type = 'life' and visible = 1  ORDER BY date_create desc limit 5 ) POST 
                    LEFT JOIN (
                        SELECT content_id, COUNT(*) AS comment_count FROM Comment GROUP BY content_id) COMMENT
                        ON POST.id = COMMENT.content_id) POST 
                        LEFT JOIN User ON POST.user_id = User.id )
            UNION ALL
            ( SELECT POST.*, User.nickname FROM (
                SELECT * FROM (
                    SELECT * FROM Content WHERE content_type = 'info' and visible = 1  ORDER BY date_create desc limit 5 ) POST 
                    LEFT JOIN (
                        SELECT content_id, COUNT(*) AS comment_count FROM Comment GROUP BY content_id) COMMENT
                        ON POST.id = COMMENT.content_id) POST 
                        LEFT JOIN User ON POST.user_id = User.id )
            UNION ALL
            ( SELECT POST.*, User.nickname FROM (
                SELECT * FROM (
                    SELECT * FROM Content WHERE content_type = 'qa' and visible = 1  ORDER BY date_create desc limit 5 ) POST 
                    LEFT JOIN (
                        SELECT content_id, COUNT(*) AS comment_count FROM Comment GROUP BY content_id) COMMENT
                        ON POST.id = COMMENT.content_id) POST 
                        LEFT JOIN User ON POST.user_id = User.id )
        `;
        read_DB.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }

            results.forEach(row => {
                row.date_create = data_utils.date_before(row.date_create);
                // COUNT
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);
            });

            return callback(null, results);
        });

    },

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
        SELECT A.*, User.nickname FROM (
        SELECT * FROM Content LEFT JOIN (
        SELECT content_id, count(*) AS comment_count FROM Comment GROUP BY content_id ) B ON Content.id = B.content_id 
        WHERE view_count > 3 AND visible = 1  ORDER BY ${order_column} ${order_rule}, date_create DESC LIMIT ? OFFSET ? ) A 
        LEFT JOIN User ON User.id = A.user_id; 
        `; 

        const query_count = `SELECT COUNT(*) AS popular_count FROM Content WHERE view_count > 3 AND visible = 1 ORDER BY date_create DESC`; 
        // view_count 3 초과 레코드 출력

        read_DB.query(query, [limit, offset], (err, results) => {
            
            if (err) {
                return callback(err, null);
            }

            results.forEach( row => {
                row.date_create = data_utils.date_before(row.date_create);
                // COUNT
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);
            });
            
            read_DB.query(query_count, (err, results_2) => {
                if (err){
                    return callback(err, null);
                }

                callback(err, results, results_2[0]);
            });
        });
    },


    /// --------------------------------------------------------------------------------------


    // 게시판 페이지 리스트 호출
    get_type: (pagetype, offset, order_type, callback) => {

        var order_column = 'date_create';
        var order_rule = 'DESC';

        // Sort check
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

        // view count -> default column
        // comment_count 
        const query = `
        SELECT A.*, User.nickname FROM (
        SELECT * FROM Content left join (
        SELECT content_id, COUNT(*) AS comment_count FROM Comment GROUP BY content_id ) B ON Content.id = B.content_id 
        WHERE content_type = ? AND visible = 1  ORDER BY ${order_column} ${order_rule}, date_create DESC LIMIT 10 OFFSET ? ) A 
        LEFT JOIN User ON User.id = A.user_id; 
        `; 

        read_DB.query(query, [pagetype, offset], (err, results) => {
            
            if (err) {
                return callback(err, null);
            }

            
            results.forEach( row => {
                // DATE String 
                row.date_create = data_utils.date_before(row.date_create);
                // COUNT
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);

            });

            return callback(null, results);
        });
    },

    // 게시물 내용 GET
    get_record: async (Content_id, view_history, request_type , callback) => {
        const query = `SELECT A.*, User.nickname FROM (SELECT * FROM Content WHERE id = ? AND visible = 1) A LEFT JOIN User ON User.id = A.user_id`;
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
                content_record.date_create = data_utils.date_before(content_record.date_create);

                return callback(null, content_record, view_history); // 배열이 아닌 인덱스 0으로 반환
            }

            callback(null, content_record, null); // 배열이 아닌 인덱스 0으로 반환
        });
    },


    // 댓글 리스트 GET
    get_comment_list: ( content_id, callback ) => {
        const query = `SELECT A.*, User.nickname FROM ( SELECT * FROM Comment WHERE content_id = ? ) A LEFT JOIN User ON A.user_id = User.id`;

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
        const query = `SELECT COUNT(*) AS total_count FROM Content WHERE content_type = ? AND visible = 1 `;
        // count 함수 사용으로 컬럼 명 정의 필요, alias 활용
        
        read_DB.query(query,[pagetype], (err, [results]) => {
            const count = Math.ceil(results.total_count / 10 ); // 소수점 반올림 

            callback(null,count); // 배열이 아닌 단일 값으로 반환**
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



module.exports = post_get_service;