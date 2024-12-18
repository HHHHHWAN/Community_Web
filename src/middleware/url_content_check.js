//middleware/URL_content_check.js

const urlPage_type_check = ( req, res, next ) => {
    const pagetype = req.params.pagetype;
    const content_type_list = ['info', 'life', 'qa', 'popular'];

    if(!content_type_list.includes(pagetype)){ // 정해진 게시판 종류 중 url에서 취득한 종류가 있는지 체크
        return res.status(404).render('forum_error.ejs',{layout:false});
    }

    next(); //유효성 완료 후 요청 진행 
};


module.exports = urlPage_type_check;