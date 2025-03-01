//middleware/URL_content_check.js

const urlPage_type_check = ( req, res, next ) => {
    const param_pagetype = req.params.pagetype;
    const query_pagetype = req.query.pagetype;
    const content_type_list = ['info', 'life', 'qa', 'popular'];

    if(!content_type_list.includes(param_pagetype)){ 
        req.params.pagetype = 'info';
    }

    if(!content_type_list.includes(query_pagetype)){ 
        req.query.pagetype = 'info';
    }

    next();
};



module.exports = urlPage_type_check;