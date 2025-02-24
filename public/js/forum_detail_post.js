function getPostload( pagetype, Content_id ){
    fetch(`/api/${pagetype}/${Content_id}`)
    .then(Response => {
        if(!Response.ok){
            switch (Response.status) {
                case 500 : 
                    throw new Error(`서버 접속 에러`);
                case 404 :
                    throw new Error(`존재하지 않은 페이지입니다.`);
                default :
                    throw new Error(`API HTTP error ! status : ${Response.status}`);
            } 
            
        }

        return Response.json();
    })
    .then( Data => {
        const Content = Data.Content_object;
        const name_box = document.getElementById('forum_detail_user_nickname');
        const date_box = document.getElementById('forum_detail_post_date');
        const count_box = document.getElementById('forum_detail_view_count');
        const title_box = document.getElementById('forum_detail_title'); 
        const text_box = document.getElementById('forum_detail_text');

        name_box.setAttribute('href',`/user/${Content.user_id}`);
        name_box.innerText = Content.nickname;
        title_box.innerHTML = Content.title;
        date_box.innerText = Content.date_create + " 작성";
        count_box.innerText = "  " + Content.view_count;

        const Purify_output = DOMPurify.sanitize(Content.text);
        text_box.innerHTML = Purify_output;  
    })
    .catch( err => {
        console.error(err);
        alert(err.message);
    });
}


