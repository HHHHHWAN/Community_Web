
const user_login_check = (req,res,next) => {
    // const contentType = req.headers['content-type'];
    const accept = req.headers['accept'].split(',');

    if(!req.session.user){

        // JSON REQUEST
        if(accept[0] === 'application/json'){
            return res.status(401).json({
                message: "인증 실패, 허가되지 않은 접근",
                returnStatus : 401 });
        }

        // EJS REQUEST
        if(accept[0] === 'text/html'){
            return res.redirect('/login');
        }

        // 그 외
        return res.status(401).render('forum_error.ejs', { layout: false, returnStatus : 401 });        
    }

    next();
};


module.exports = user_login_check;