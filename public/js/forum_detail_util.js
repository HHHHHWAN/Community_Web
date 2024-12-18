// js/forum_detail_util.js


function autoheight(textarea){
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}


function setContent_delete(content_type, content_id){
    fetch(`/delete/${content_id}` , { method : 'DELETE'})
    .then(Response => {
        if(!Response.ok){
            throw new Error('failed get api');
        }
        
        return Response.json();
    })
    .then(data => {
        window.location.href= `/${content_type}`;
        alert(data.message);
    })
    .catch(error => {
        console.error('error deletubg data',ReferenceError);
    });
}