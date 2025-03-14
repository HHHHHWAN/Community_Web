const { read_DB , write_DB  } = require('../models/mysql_connect');
const data_utils = require('../utils/dataUtils');
const data_recreate = require('../utils/re_structure');
const redis_client = require('../models/redis_connect');

// UPDATE 조회수 증가    
async function detail_add_viewcount(content_id){
    const query = `UPDATE Content SET view_count = view_count + 1 WHERE id = ?`;
    write_DB.query(query, [content_id], (err) => {
        if (err) {
            console.error(`( detail_add_viewcount ) Content id : ${content_id}`);
            console.error("( detail_add_viewcount ) View Count Error : ", set_view.err);
        }
    });
};


const post_get_service = {

    // 카테고리 별 최신 글 리스트
    get_mainpage_contents : async ( callback ) => {
        const read_DB_promise = read_DB.promise();
        const cacheKey = 'mainpage:list';
        try{

            if(redis_client.isReady){
                const cache_data = await redis_client.get(cacheKey);
                if(cache_data){
                    // console.log(" Catch Mainpage list in redis DB ");
                    return callback(null,JSON.parse(cache_data));
                }
            }

            const query = `
            WITH MAIN_CONTENT AS (
                SELECT *
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER ( PARTITION BY content_type ORDER BY date_create DESC ) AS rn
                    FROM Content
                ) SUB
                WHERE rn <= 5 
            )
            SELECT MAIN_CONTENT.*, User.nickname, COALESCE( COMMENT.comment_count, 0 ) AS comment_count
            FROM MAIN_CONTENT
            LEFT JOIN (
                SELECT content_id, COUNT(*) AS comment_count
                FROM Comment
                WHERE visible = 1
                GROUP BY content_id 
            ) COMMENT ON MAIN_CONTENT.id = COMMENT.content_id
            LEFT JOIN User ON MAIN_CONTENT.user_id = User.id;
            `;

            const [DB_results] = await read_DB_promise.query(query);

            DB_results.forEach(row => {
                row.date_create = data_utils.date_before(row.date_create);
                // COUNT
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);
            });

            if( redis_client.isReady ){
                redis_client.setEx(cacheKey, 100, JSON.stringify(DB_results)); // 100초
            }
        
            callback(null, DB_results);

        }catch(err){
            console.error("( get_mainpage_contents ) DB : ", err.stack );
            callback(500, null);
        }
    },

    // 인기 게시글 리스트 
    get_popular_contents: (limit, offset, order_type, callback) => {

        // 요청 정렬 체크
        let order_column = 'date_create';
        let order_rule = 'DESC';

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
        SELECT A.*, User.nickname 
        FROM (
            SELECT * 
            FROM Content 
            LEFT JOIN (
                SELECT content_id, count(*) AS comment_count 
                FROM Comment 
                WHERE visible = 1
                GROUP BY content_id ) B 
            ON Content.id = B.content_id 
            WHERE view_count > 15 AND visible = 1  
            ORDER BY ${order_column} ${order_rule}, date_create DESC LIMIT ? OFFSET ? 
        ) A LEFT JOIN User ON User.id = A.user_id; 
        `; 

        
        // 조회 15 초과 레코드 출력

        read_DB.query(query, [limit, offset], (err, query_select_result ) => {
            
            if (err) {
                console.error(" ( get_popular_contents ) MySql2 : ", err.stack );
                return callback(500, null);
            }

            // 데이터 UI 수정 ( 날짜, 조회수, 댓글 수 )
            query_select_result.forEach( row => {
                row.date_create = data_utils.date_before(row.date_create);
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);
            });


            if ( limit < 6 ){
                return callback(null, query_select_result, null);
            }

            const query_page = `
            SELECT COUNT(*) AS popular_count 
            FROM Content 
            WHERE view_count > 15 AND visible = 1 
            ORDER BY date_create DESC
            `; 
            
            // 리스트 페이지 수
            read_DB.query(query_page, (err, query_result_count ) => {
                if (err){
                    console.error(" ( get_popular_contents : count ) MySql2 : ", err.stack );
                    return callback(500, null);
                }

                const count = Math.ceil(query_result_count[0].popular_count / 10 );  

                callback(null, query_select_result, count);
            });
        });
    },


    /// --------------------------------------------------------------------------------------


    // GET 게시판 페이지 리스트 
    get_type: (pagetype, offset, order_type, callback) => {

        let order_column = 'date_create';
        let order_rule = 'DESC';

        // 요청정렬 체크
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
        SELECT A.*, User.nickname 
        FROM (
            SELECT * 
            FROM Content 
            left join (
                SELECT content_id, COUNT(*) AS comment_count 
                FROM Comment 
                GROUP BY content_id ) B 
                ON Content.id = B.content_id 
            WHERE content_type = ? 
                AND visible = 1  
            ORDER BY ${order_column} ${order_rule}, date_create DESC 
            LIMIT 10 
            OFFSET ? ) A 
        LEFT JOIN User 
        ON User.id = A.user_id; 
        `; 

        read_DB.query(query, [pagetype, offset], (err, results) => {
            
            if (err) {
                console.error("( get_type ) MySql2 : ", err.stack);
                return callback(500, null);
            }

            
            // 데이터 UI 수정 ( 날짜, 조회수, 댓글 수 )
            results.forEach( row => {
                row.date_create = data_utils.date_before(row.date_create);
                row.view_count = data_utils.content_count_change(row.view_count);
                row.comment_count = data_utils.content_count_change(row.comment_count);

            });

            return callback(null, results);
        });
    },

    // 한 게시물 내용 
    get_post_detail: ( Content_id, view_history , callback ) => {

        const query = `
        SELECT A.*, User.nickname 
        FROM (
            SELECT * 
            FROM Content 
            WHERE id = ? 
                AND visible = 1) A 
        LEFT JOIN User 
        ON User.id = A.user_id`;

        read_DB.query(query, [Content_id], (err, results) => {
            if (err) {
                console.error("( get_post_detail ) MySQL2 : \n", err.stack );
                return callback(500, null);
            }

            if(!results.length){
                return callback(404, null);
            }

            const content_record = results[0];

            // 조회기록 체크
            if(!view_history.some(view_post => view_post === Content_id)){
                view_history.push(Content_id);
                detail_add_viewcount(Content_id);
            }

            // 날짜 정보 가공
            content_record.date_create = data_utils.date_before(content_record.date_create);

            return callback(null, content_record, view_history); 

        });
    },

    // GET 게시글 수정
    get_post_edit: ( content_id, request_user_id, callback ) => {

        const query = `SELECT * FROM Content WHERE id = ? AND user_id = ?  AND visible = 1`;

        read_DB.query(query, [content_id, request_user_id], (err, results) => {
            if (err) {
                console.error("( get_post_edit ) MySQL2 : \n", err.stack );
                
                return callback(500, null);
            }

            // 권한 없음
            if(!results.length){
                return callback(403, null);
            }

            const content_record = results[0];
            

            callback(null, content_record); 
        });
    },


    // 댓글 리스트 
    get_comment_list: ( content_id, callback ) => {
        const query = `SELECT A.*, User.nickname FROM ( SELECT * FROM Comment WHERE content_id = ? ) A LEFT JOIN User ON A.user_id = User.id`;

        read_DB.query(query, [content_id], ( err, comment_results ) => {
            if (err){
                console.error("( get_comment_list ) MySql2 : " , err.stack );
                return callback (null);
            }


            // 날짜 가공
            comment_results.forEach( row => {
                row.create_at = data_utils.date_before(row.create_at);
            });

            // 노출 체크
            const { list, change_count } = data_utils.change_delete_comment_text(comment_results);
            const comment_count = comment_results.length - change_count;


            // 종속 트리 생성 ( 대댓글 )
            comment_results = data_recreate.comment_structure(list);

            callback({ Count : comment_count , Comments: comment_results});
        });

    },

    // 리스트 페이지 수
    get_page_count: (pagetype, callback ) =>{
        const query = `SELECT COUNT(*) AS total_count FROM Content WHERE content_type = ? AND visible = 1 `;
    
        
        read_DB.query(query,[pagetype], (err, [results]) => {

            if (err){
                console.error("( get_page_count ) MySql2 : " , err.stack );
                return callback(500);
            }

            const count = Math.ceil(results.total_count / 10 ); // 소수점 반올림 

            callback(null, count); // 배열이 아닌 단일 값으로 반환**
        });
    },

    // 검색 결과 반환
    get_search_post :  async (search_text, top_page, bottom_page, callback) => { 
        const query_contents = `
        SELECT * 
        FROM Content 
        WHERE ( title like ? OR text LIKE ? ) 
            AND visible = 1 
        LIMIT 5 OFFSET ?`;

        const query_comments = `
        SELECT A.*, Content.content_type AS content_type, Content.title AS content_title 
        FROM ( 
            SELECT * 
            FROM Comment 
            WHERE comment LIKE ? 
                AND visible = 1 
            LIMIT 5 OFFSET ?
        ) A LEFT JOIN Content ON Content.id = A.content_id`;

        const query_search_count = `
        SELECT A.contents_count, B.comments_count
        FROM (  
            SELECT 1 AS join_key, COUNT(*) AS contents_count 
            FROM Content 
            WHERE ( title LIKE ? OR text LIKE ? 
                ) AND visible = 1
        ) A JOIN (
            SELECT 1 AS join_key ,COUNT(*) AS comments_count 
            FROM Comment 
            WHERE comment 
                LIKE ? 
                AND visible = 1
        ) B ON A.join_key = B.join_key
        `;

        const wild_text = `%${search_text}%`;
        const top_offset = (top_page - 1)* 5;
        const bottom_offset = (bottom_page - 1) * 5;

        // promise 형식으로 반환
        const read_DB_promise = read_DB.promise();

        try{
            const [ result_contents ]  = await read_DB_promise.query(query_contents,[wild_text, wild_text, top_offset]);
            const [ result_comments ]  = await read_DB_promise.query(query_comments,[wild_text, bottom_offset]);

            const [result_count]  = await read_DB_promise.query(query_search_count,[wild_text, wild_text, wild_text]);


            contents_object = {
                count : result_count[0].contents_count,
                page : Math.ceil(result_count[0].contents_count / 5)
            }

            comments_page = {
                count : result_count[0].comments_count,
                page : Math.ceil(result_count[0].comments_count / 5)
            }

            callback(null, {
                    Contents_list : result_contents,
                    Comments_list : result_comments,
                    Content_total : contents_object,
                    Comment_total : comments_page
                }
            );

        }catch(err){ 
            console.error(" ( get_search_post ) MySQL2 query Error : ", err.stack );
            return callback(500, null);
        }
    }

};



module.exports = post_get_service;