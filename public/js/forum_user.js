// js/forum_user.js

(function() {
    const user_info_el = document.querySelector('.user_info_box');
    const post_dom = document.querySelector('.user_list_box_dom');
    const more_button = document.getElementById('more_button');

    const USER_ID = user_info_el.dataset.user_id;
    
    function stripHtmlTags(html) {
        return html.replace(/<\/?[^>]+(>|$)/g, "");
    }
    
    const get_user_contents = async (user_id, page) => {
        try{
            const api_response = await fetch(`/user/${user_id}/posting?page=${page}`, {
                method : 'GET',
                headers : {
                    'Accept' : 'application/json'
                }
            });
     
            const api_result = await api_response.json();
    
            if(!api_response.ok){
                throw new Error(api_result.message);
            }
    
            const api_data = api_result.data;
    
            if(api_data.post_list.length < 10){
                more_button.setAttribute('disabled',true);
            }
    
            if(api_data.post_list.length){
                api_data.post_list.forEach(row => {
                    const post_li = document.createElement('li');
                    const post_li_div = document.createElement('div');
                    post_li_div.setAttribute('class','post_li_div');
                    post_li_div.innerHTML = `
                    <div style="display: flex; width: 100%;">
                        <div style="flex: 7;"><a href='/${row.content_type}'>${row.post_name}</a> 게시판에 게시물을 작성했습니다. </div>
                        <div style="flex: 1; display: flex; justify-content: right;">${row.date_now}</div>
                    </div>
                    <div style="display: flex; height: 30px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;">
                        <a href='/${row.content_type}/${row.id}' class='post_url'></a>
                    </div>                
                    `;
                    post_li_div.querySelector('.post_url').textContent = row.title;
                    post_li.appendChild(post_li_div);
                    post_dom.appendChild(post_li);
                });
            } else {
                post_dom.innerHTML = `
                 <div style="display: flex; height: 30px; align-items: center; justify-content:center;"> 아직 작성한 게시물이 없습니다.<div>
                `;
            }
            
        }catch(err){
            console.error(err);
            alert("요청을 처리하지 못했습니다.\n잠시후 다시 시도해주세요.");
        }
    };
    
    
    const get_user_activity = async (user_id, page) => {
        try{
            const api_response = await fetch(`/user/${user_id}/activity?page=${page}`, {
                method : 'GET',
                headers : {
                    'Accept' : 'application/json'
                }
            });
     
            const api_result = await api_response.json();
    
            if(!api_response.ok){
                throw new Error(api_result.message);
            }
    
            const api_data = api_result.data;
    
            if(api_data.activity_list.length < 10){
                
                more_button.setAttribute('disabled', true);
            }
    
            if(api_data.activity_list.length){
                api_data.activity_list.forEach(row => {
                    const post_li = document.createElement('li');
                    const post_li_div = document.createElement('div');
                    post_li_div.setAttribute('class','post_li_div');
                    post_li_div.innerHTML = `
                    <div style="display: flex; width: 100%; font-size: 12px;">
                        <div style="flex: 7;">
                            <a href='/user/${row.user_id}' class='user_nickname_href'></a>님의 
                            ${row.history_type === 'comment' ? '게시글에 댓글을 <span style="color: green;">작성</span>했습니다.' 
                                : row.target_type === 'content' ? '게시글을 <span style="color: green;">추천</span>했습니다.'
                                :'게시글에 댓글을 <span style="color: green;">추천</span>했습니다.' } 
                        </div>
                        <div style="flex:1; display: flex; justify-content: right;">${row.date_now}</div>
                    </div>
                    <div class='post_li_div_title' style="display: flex; height: 30px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;">
                        <a href='/${row.content_type}/${row.content_id}'>${stripHtmlTags(row.title)}</a> 
                    </div>               
                    `;
                    post_li_div.querySelector('.user_nickname_href').textContent = row.nickname;
                    post_li.appendChild(post_li_div);
                    post_dom.appendChild(post_li);
                });
            }else {
                post_dom.innerHTML = `
                 <div style="display: flex; height: 30px; align-items: center; justify-content:center;"> 아직 활동이 없습니다.<div>
                `;
            }
        }catch(err){
            console.error(err);
            alert("요청을 처리하지 못했습니다.\n잠시후 다시 시도해주세요.");
        }
        
    };

    // BOOKMARK LIST
    const get_user_bookmark = async (page) => {
        try{
            const api_response = await fetch(`/user/bookmark/list?page=${page}`, {
                method : 'GET',
                headers : {
                    'Accept' : 'application/json'
                }
            });
     
            const api_result = await api_response.json();
    
            if(!api_response.ok){
                throw new Error(api_result.message);
            }
    
            const api_data = api_result.data;
    
            if(api_data.list.length < 10){
                more_button.setAttribute('disabled', true);
            }
    
            if(api_data.list.length){
                api_data.list.forEach(row => {
                    const post_li = document.createElement('li');
                    const post_li_div = document.createElement('div');
                    post_li_div.setAttribute('class','post_li_div');
                    post_li_div.innerHTML = `
                    <div style="display: flex; width: 100%;">
                        <div style="flex: 7;"><a href='/user/${row.user_id}'>${row.nickname}</a> 님이 작성한 글을 북마크 </div>
                        <div style="flex: 1; display: flex; justify-content: right;">${row.date_now}</div>
                    </div>
                    <div style="display: flex; height: 30px; align-items: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis;">
                        <a href='/${row.content_type}/${row.id}' class='post_url'></a>
                    </div>                
                    `;
                    post_li_div.querySelector('.post_url').textContent = row.title;
                    post_li.appendChild(post_li_div);
                    post_dom.appendChild(post_li);
                });
            } else {
                post_dom.innerHTML = `
                 <div style="display: flex; height: 30px; align-items: center; justify-content:center;"> 아직 작성한 게시물이 없습니다.<div>
                `;
            }

        }catch(err){
            console.error(err);
            alert("요청을 처리하지 못했습니다.\n잠시후 다시 시도해주세요.");
        }
    };
    

    // init 
    const nav_ctl = document.querySelector('.user_info_box_ctl');
    const user_contents = document.querySelector('.user_contents');

    let currnet_nav = "user_contents";
    let count=1;

    // init nav
    get_user_contents(USER_ID, count);
    user_contents.classList.add('active');

    nav_ctl.addEventListener('click', function(event){
        const target = event.target;
        if( target.tagName !== 'BUTTON' ) return;

        nav_ctl.querySelectorAll('Button').forEach( el => {
            el.classList.remove('active');
        });

        currnet_nav = target.className;
        target.classList.add('active');
        more_button.removeAttribute('disabled');

        post_dom.innerHTML = '';
        count = 1;

        if(currnet_nav === 'user_contents'){
            get_user_contents(USER_ID, count);
            return;
        }
        if(currnet_nav === 'user_activity'){
            get_user_activity(USER_ID, count);
            return;
        }
        if(currnet_nav === 'user_bookmark'){
            get_user_bookmark(count);
        }

    });

    more_button.addEventListener('click', ()=>{
        count += 1; // page + 1
        if(currnet_nav === 'user_contents'){
            get_user_contents(USER_ID, count);
            return;
        }

        if(currnet_nav === 'user_activity'){
            get_user_activity(USER_ID, count);
            return;
        }

        if(currnet_nav === 'user_bookmark'){
            get_user_bookmark(count);
        }
    });

})()
