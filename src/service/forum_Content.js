// models/forum_Content ( contents_db )
const { read_DB , write_DB  } = require('../models/mysql_connect');
const data_utils = require('../utils/dataUtils');
const data_recreate = require('../utils/re_structure');

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

        //popular post list 
        var query = `select A.*, User.nickname from ( select * from Content where view_count > 3 and visible = 1 order by date_create desc limit ? offset ? ) A left join User on User.id = A.user_id`;

        switch(order_type){
            case "oldest_order" :
                query = `select A.*, User.nickname from ( select * from Content where view_count > 3 and visible = 1 limit ? offset ? ) A left join User on User.id = A.user_id`;
                break;
            case "view_count_order" :
                query = `select A.*, User.nickname from ( select * from Content where view_count > 3 and visible = 1 order by view_count desc limit ? offset ? ) A left join User on User.id = A.user_id`;
                break;
            default : 
        }

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

        var query = `select A.*, User.nickname from ( select * from Content where content_type = ? and visible = 1  order by date_create desc limit 10 offset ? ) A left join User on User.id = A.user_id `; 
        
        switch(order_type){
            case "oldest_order" :
                query = `select A.*, User.nickname from ( select * from Content where content_type = ? and visible = 1 limit 10 offset ? ) A left join User on User.id = A.user_id `; 
                break;
            case "view_count_order" :
                query = `select A.*, User.nickname from ( select * from Content where content_type = ? and visible = 1  order by view_count desc limit 10 offset ? ) A left join User on User.id = A.user_id `; 
                break;
            default : 
        }



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
    
    // 게시물 내용 가져오기
    get_record: (id,callback) => {
        const query = `select A.*, User.nickname from (select * from Content where id = ? and visible = 1) A left join User on User.id = A.user_id`;

        read_DB.query(query, [id], (err, results) => {
            
            if (err) {
                return callback(err, null);
            }

            results[0].date_create = data_utils.date_before(results[0].date_create);

            return callback(null, results[0]); // 배열이 아닌 단일 값으로 반환**
        });
    },

    get_comment_list: ( content_id , callback ) => {
        const query = `select A.*, User.nickname from ( select * from Comment where content_id = ? ) A left join User on A.user_id = User.id`;

        read_DB.query(query, [content_id], ( err, comment_results ) => {
            if (err){
                console.log("error code 0000 : " , err);
            }

            comment_results.forEach( row => {
                row.create_at = data_utils.date_before(row.create_at);
            });

            comment_results = data_utils.change_delete_comment_text(comment_results);

            comment_results = data_recreate.comment_structure(comment_results);

            callback(comment_results);
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

    // view_count 증가 쿼리
    set_viewcount: (id, callback) => {
        const query = `update Content set view_count = view_count + 1 where id = ?`;
        write_DB.query(query, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    },

    //새 게시물 insert 쿼리
    create_content: (title, text, content_type , user_id , callback) => {
        const query = `insert into Content (title, text, content_type , user_id ) values (?, ?, ?, ?)`;
        write_DB.query(query, [title, text, content_type , user_id ], (err, result) => {
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

    get_search_post :  async (search_text,front_page, back_page, callback) => { 
        const query_contents = `select * from Content where ( title like ? or text like ? ) and visible = 1 limit 5 offset ?`;
        const query_comments = `select A.*, Content.content_type as content_type, Content.title as content_title from ( select * from Comment where comment like ? and visible = 1 limit 5 offset ?) A left join Content on Content.id = A.content_id`;

        // 통합 가능
        const query_contents_count = `select count(*) as count from Content where ( title like ? or text like ? ) and visible = 1`;
        const query_comments_count = `select count(*) as count from Comment where comment like ? and visible = 1`;

        const wild_text = `%${search_text}%`;
        const front_offset = (front_page - 1)* 5;
        const back_offset = (back_page - 1) * 5;

        // promise 형식으로 반환
        const read_DB_promise = read_DB.promise();

        try{
            const result_contents  = await read_DB_promise.query(query_contents,[wild_text, wild_text, front_offset]);
            const result_comments  = await read_DB_promise.query(query_comments,[wild_text, back_offset]);
            const result_contents_count  = await read_DB_promise.query(query_contents_count,[wild_text, wild_text]);
            const result_comments_count  = await read_DB_promise.query(query_comments_count,[wild_text]);

            const contents_page = Math.ceil(result_contents_count[0][0].count / 5);
            const comments_page = Math.ceil(result_comments_count[0][0].count / 5);
            result_contents_count[0][0].page = contents_page;
            result_comments_count[0][0].page = comments_page;

            // promise 형식 반환시 [rows, fields]로 반환하게 됨 
            callback(null,result_contents[0], result_comments[0], result_contents_count[0][0], result_comments_count[0][0]);

        }catch(err){ // query 함수 err 캐치
            return callback(err,null,null,null,null);
        }

        // callback 함수 처리경우
        // read_DB.query(query_contents, [wild_text, wild_text, front_offset] , (err,result_contents) => {
        //     if(err){
        //         return callback(err,null,null,null);
        //     }

        //     read_DB.query(query_comments, [wild_text, back_offset] , (err,result_comments) => {
        //         if(err){
        //             return callback(err,null,null);
        //         }
        //         callback(null,result_contents,result_comments);
        //     });
        // });
    }
};

module.exports = Content;