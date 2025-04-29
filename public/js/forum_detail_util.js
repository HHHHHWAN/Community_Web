(function(){
    const title_el = document.querySelector('.forum_detail_title_box');
    const post_delete_el = document.getElementById('post_delete_button');
    const post_button_el = document.getElementById('forum_detail_select');

    // Current Post ID
    const content_id = title_el.dataset.post_id;


    if(post_delete_el){
        const content_type = post_delete_el.dataset.post_type;

        post_delete_el.addEventListener('click', () => {
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
        });
    }

    if(post_button_el){ // login check
        
        // comment_div 
        const comment_div_el = document.querySelector('.forum_detail_comment');
        

        const CHECK_COLOR = 'green';
        let isProcessing = false;
        let isLike_type = 'content';

        let request_url = {
            Bookmark : `/user/bookmark/${content_id}`,
            Like : ``
        }

        function updateUI(el){ 
            el.style.color = el.dataset.status ? CHECK_COLOR : '';

            let like_count_el = document.getElementById('post_like_count');

            if( isLike_type === 'comment'){
                like_count_el = el.parentElement.previousElementSibling.querySelector('.comment_like_count');
            }

            const current_count = parseInt(like_count_el.textContent);

            like_count_el.textContent = el.dataset.status ?
            current_count + 1  : current_count - 1;
        }

        // Request API
        async function request_check(method, el, event_name){
            isProcessing = true;

            try{
                const api_Response = await fetch(request_url[event_name],{
                    method : method,
                    headers : {
                        'Accept' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    }
                });
                const api_result = await api_Response.json();
                const api_data = api_result.data;

                if(!api_Response.ok){
                    throw Error(api_result.message);
                }
    
                // checked event
                if(api_data.check){ 
                    el.dataset.status = method === 'POST' ? 1 : ''; // comment-data
                    updateUI(el);
                }
            }catch(err){
                alert(err);
                console.error('요청 중, 문제가 발생했습니다 : ', err);
                window.location.reload();
            }finally{
                isProcessing = false;
            }
        }

        // Comment area event
        comment_div_el.addEventListener('click', (event) => {
            if (isProcessing) return;

            if (event.target.classList.contains('button_like')){
                const target_el = event.target;
                const event_name = 'Like';
                isLike_type = 'comment';

                request_url[event_name] = `/like/comment/${target_el.dataset.comment_id}`;
                const method = target_el.dataset.status ? 'DELETE' : 'POST';

                request_check(method, target_el, event_name);
            }
        });
    
        // Content area event
        post_button_el.addEventListener('click',(event) => {
            if (isProcessing) return;

            // Bookmark
            if( event.target.id === "button_bookmark"){
                const target_el = event.target;
                const event_name = 'Bookmark';
                const method = target_el.dataset.status ? 'DELETE' : 'POST';

                request_check(method, target_el, event_name);
            }

            // Like 
            if (event.target.classList.contains('button_like')){
                const target_el = event.target;
                const event_name = 'Like';
                isLike_type = 'content';

                request_url[event_name] = `/like/content/${content_id}`;
                const method = target_el.dataset.status ? 'DELETE' : 'POST';
                
                request_check(method, target_el, event_name);
            }
        });
    }

})();

