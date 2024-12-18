
const user_login_check = (req,res,next) => {
    if(!req.session){
        return res.redirect('/login');
    }
    next();
};


module.exports = user_login_check;