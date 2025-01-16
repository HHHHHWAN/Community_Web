
const user_login_check = (req,res,next) => {
    if(!req.session.user){
        if(req.method === 'GET'){
            return res.redirect('/login');
        }
        return res.status(401).render('forum_error.ejs',{layout: false, returnStatus : 401 });
    }
    next();
};


module.exports = user_login_check;