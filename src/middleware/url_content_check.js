//middleware/URL_content_check.js

const urlPage_type_check = ( req, res, next ) => {
    const pagetype = req.params.pagetype;
    const content_type_list = ['info', 'life', 'qa', 'popular'];

    if(!content_type_list.includes(pagetype)){ 
        return res.status(404).render('forum_error.ejs',{layout:false, returnStatus: 404});
    }
    next();
};



module.exports = urlPage_type_check;