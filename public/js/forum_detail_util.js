// js/forum_detail_util.js


function autoheight(textarea){
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}


function setContent_delete(content_type, content_id){
    fetch(`/post/delete`,{
        method :'DELETE',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'X-CSRF-Token' : user_csrf_token
        },
        body : JSON.stringify({
            post_id : content_id
        })
    })
    .then(Response => {
        if(!Response.ok){
            throw new Error('Failed API Request');
        }
        
        return Response.json();
    })
    .then(data => {
        window.location.href= `/${content_type}`;
        alert(data.message);
    })
    .catch(error => {
        console.error(error);
        alert('요청 처리 중, 문제가 발생했습니다.');
    });
}