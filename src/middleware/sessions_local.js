// session_middle 

const session_middle = (req, res, next) =>{
    res.locals.csrf = req.csrfToken();
    if(req.session.user){
        res.locals.userId = req.session.user.user_id;
        res.locals.nickname = req.session.user.nickname;
        res.locals.ROLE = req.session.user.role;
    }else{
        res.locals.userId = null;
        res.locals.nickname = null;
        res.locals.ROLE = null;
    }

    next();
}


module.exports = session_middle;

