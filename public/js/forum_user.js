// js/forum_user.js
const post_dom = document.querySelector('.user_list_box_dom');
const more_button = document.getElementById('more_button');

function get_user_contents(user_id, page){
    fetch(`/user/${user_id}/post?page=${page}`)
    .then( res => {
        if(!res.ok){
            throw new error("서버 요청 실패");
        }
        return res.json();
    })
    .then((data) => {
        if(data.post_list.length){
            data.post_list.forEach(row => {
                const post_li = document.createElement('li');
                const post_li_div = document.createElement('div');
                post_li_div.setAttribute('class','post_li_div');
                post_li_div.innerHTML = `
                <div style="display: flex; width: 100%;">
                    <div style="flex: 7;"><a href='/${row.content_type}'>${row.post_name}</a> 게시판에 게시물을 작성했습니다. </div>
                    <div style="flex: 1; display: flex; justify-content: right;">${row.date_now}</div>
                </div>
                <div style="display: flex; height: 30px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"><a href='/${row.content_type}/${row.id}' class='post_url'></a></div>                
                `;
                post_li_div.querySelector('.post_url').textContent = row.title;
                post_li.appendChild(post_li_div);
                post_dom.appendChild(post_li);
            });

            if(data.post_list.length < 10){
                more_button.setAttribute('disabled',true);
            }

        } else {
            post_dom.innerHTML = `
             <div style="display: flex; height: 30px; align-items: center; justify-content:center;"> 아직 작성한 게시물이 없습니다.<div>
            `;
        }
    }).catch((err) => {
        request_error(err);
    });
};


function get_user_activity(user_id, page){
    fetch(`/user/${user_id}/activity?page=${page}`)
    .then( res => {
        if(!res.ok){
            throw new error("서버 요청 실패");
        }

        return res.json();
    })
    .then((data) => {
        if(data.activity_list.length){
            data.activity_list.forEach(row => {
                const post_li = document.createElement('li');
                const post_li_div = document.createElement('div');
                post_li_div.setAttribute('class','post_li_div');
                post_li_div.innerHTML = `
                <div style="display: flex; width: 100%;">
                    <div style="flex: 7;">
                        <a href='/user/${row.content_user_id}' class='user_nickname_href'></a>님의 
                        <a href='/${row.content_type}/${row.content_id}'>게시물</a>에 댓글을 작성했습니다. 
                    </div>
                    <div style="flex:1; display: flex; justify-content: right;">${row.date_now}</div>
                </div>
                <div class='post_li_div_title' style="display: flex; height: 30px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></div>               
                `;

                post_li_div.querySelector('.user_nickname_href').textContent = row.nickname;
                post_li_div.querySelector('.post_li_div_title').textContent = row.comment;
                post_li.appendChild(post_li_div);
                post_dom.appendChild(post_li);
            });

            if(data.activity_list.length < 10){
                more_button.setAttribute('disabled',true);
            }

        }else {
            post_dom.innerHTML = `
             <div style="display: flex; height: 30px; align-items: center; justify-content:center;"> 아직 작성한 게시물이 없습니다.<div>
            `;
        }

    }).catch((err) => {
        request_error(err);
    });
};

function request_error(err){
    console.error(err);
    alert("잠시후 다시 시도해주세요.");
};


function callUserinfo(user_id){
    const nav_ctl = document.querySelector('.user_info_box_ctl');
    const user_activity = document.querySelector('.user_activity');
    const user_contents = document.querySelector('.user_contents');

    var currnet_info="contents";
    var count=1;

    get_user_contents(user_id, count);
    user_contents.classList.add('active');

    nav_ctl.addEventListener('click', function(event){
        if(event.target.classList.contains('user_contents') || event.target.classList.contains('user_activity')){
            user_activity.classList.remove('active');
            user_contents.classList.remove('active');
            
            event.target.classList.add('active');

            post_dom.innerHTML = '';
            

            if(event.target.classList.contains('user_contents')){
                currnet_info='contents';
                more_button.removeAttribute('disabled');
                count=1;
                get_user_contents(user_id, count);
            }else{
                currnet_info='activity';
                more_button.removeAttribute('disabled');
                count=1;
                get_user_activity(user_id, count);
            }
        }
    });

    more_button.addEventListener('click', ()=>{
        count += 1;
        console.log(count);
        if(currnet_info === 'contents'){
            get_user_contents(user_id, count);
        }else{
            get_user_activity(user_id, count);
        }
    });
};