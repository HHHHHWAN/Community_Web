
const user_login_check = (req,res,next) => {
    const contentType = req.headers['content-type'];
    const accept = req.headers['accept'];

    if(!req.session.user){

        if(contentType || accept){
            return res.status(401).json({
                message: "인증 실패, 허가되지 않은 접근",
                returnStatus : 401 });
        }

        if(req.method === 'GET'){
            return res.redirect('/login');
        }

        return res.status(401).render('forum_error.ejs',{layout: false, returnStatus : 401 });        
    }

    next();
};


module.exports = user_login_check;