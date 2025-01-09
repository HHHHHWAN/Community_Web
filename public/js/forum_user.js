// js/forum_user.js

function get_user_contents(user_id){
    fetch(`/user/${user_id}/post`)
    .then( res => {
        if(!res.ok){
            return new error("서버 요청 실패");
        }

        return res.json();

    })
    .then((data) => {
        const post_dom = document.querySelector('.user_list_box_dom');
        post_dom.innerHTML = '';
        if(data.post_list.length){
            data.post_list.forEach(row => {
                const post_li = document.createElement('li');
                const post_li_div = document.createElement('div');
                post_li_div.setAttribute('class','post_li_div');
                post_li_div.innerHTML = `
                <div class='post_li_div_info'>
                    <div><a href='/${row.content_type}'>${row.post_name}</a> 게시판에 게시물을 작성했습니다. </div>
                    <div>${row.date_now}</div>
                </div>
                <div class='post_li_div_title'><a href='/${row.content_type}/${row.id}' class='post_url'></a></div>                
                `;
                post_li_div.querySelector('.post_url').textContent = row.title;
                post_li.appendChild(post_li_div);
                post_dom.appendChild(post_li);
            });
        } else {
            post_dom.innerHTML = `
             <div> 아직 작성한 게시물이 없습니다.<div>
            `;
        }
        
    }).catch((err) => {
        request_error(err);
    });
}


function get_user_activity(user_id){
    fetch(`/user/${user_id}/activity`)
    .then( res => {
        if(!res.ok){
            return new error("서버 요청 실패");
        }

        return res.json();
    })
    .then((data) => {
        const post_dom = document.querySelector('.user_list_box_dom');
        post_dom.innerHTML = '';
        if(data.activity_list.length){
            data.activity_list.forEach(row => {
                const post_li = document.createElement('li');
                const post_li_div = document.createElement('div');
                post_li_div.setAttribute('class','post_li_div');
                post_li_div.innerHTML = `
                <div class='post_li_div_info'>
                    <div>
                        <a href='/user/${row.content_user_id}' class='user_nickname_href'></a>님의 
                        <a href='/${row.content_type}/${row.content_id}'>게시물</a>에 댓글을 작성했습니다. 
                    </div>
                    <div>${row.date_now}</div>
                </div>
                <div class='post_li_div_title'></div>                
                `;
                post_li_div.querySelector('.user_nickname_href').textContent = row.nickname;
                post_li_div.querySelector('.post_li_div_title').textContent = row.comment;
                post_li.appendChild(post_li_div);
                post_dom.appendChild(post_li);
            });
        }else {
            post_dom.innerHTML = `
             <div> 아직 활동 내역이 없습니다.<div>
            `;
        }

    }).catch((err) => {
        request_error(err);
    });

}

function request_error(err){
    alert(err,"잠시후 다시 시도해주세요.");
}


function eventsetting(user_id){
    get_user_contents(user_id);

    document.addEventListener('click', function(event){

        if(event.target.classList.contains('user_contents')){
            const button_div = event.target.parentElement;
            get_user_contents(user_id);
        }
        
        if(event.target.classList.contains('user_activity')){
            const button_div = event.target.parentElement;
            get_user_activity(user_id);
        }

        if(event.target.classList.contains('user_personal_setting')){
            const button_div = event.target.parentElement;
            create_setting_DOM(user_id);
        }

    });
}