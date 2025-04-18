// js/forum_detail_util.js

(function(){
    const title_el = document.querySelector('.forum_detail_title_box');
    const post_delete_el = document.getElementById('post_delete_button');
    const bookmark_button_el = document.getElementById('forum_detail_select');

    // Current Post ID
    const content_id = title_el.dataset.post_id;


    if(post_delete_el){
        // const content_id = post_delete_el.dataset.post_id;
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

    if(bookmark_button_el){
        const button_bookmark_el = document.getElementById('button_bookmark');
        // const content_id = bookmark_button_el.dataset.post_id;

        let isProcessing = false;
        let isBookmarked = false;
        const BOOKMARK_COLOR = 'green';

        function updateButton(el){
            el.style.color = isBookmarked ? BOOKMARK_COLOR : '';
        }

        async function init_bookmark() {
            try{
                const api_Response = await fetch(`/user/bookmark/${content_id}`,{
                    method : 'GET',
                    headers : {
                        'Accept' : 'application/json',
                    }
                });
    
                const api_result = await api_Response.json();
                const api_data = api_result.data;
    
                if(api_data.check){ // 북마크 존재 여부, 변경 성공 
                    isBookmarked = true;
                    updateButton(button_bookmark_el);
                }
            
            }catch(err){
                console.error('북마크 상태 확인 중, 문제가 발생했습니다 : ',err);
            }  
        }

        async function request_bookmark(method){
            if (isProcessing) return;

            isProcessing = true;

            try{
                const api_Response = await fetch(`/user/bookmark/${content_id}`,{
                    method : method,
                    headers : {
                        'Accept' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    }
                });
    
                const api_result = await api_Response.json();
                const api_data = api_result.data;
    
                if(api_data.check){ 
                    isBookmarked = method === 'POST';
                    updateButton(button_bookmark_el);
                }
            
            }catch(err){
                console.error('북마크 요청 중, 문제가 발생했습니다 : ', err);
            }finally{
                isProcessing = false;
            }
        }
    
        bookmark_button_el.addEventListener('click',(event) => {
            //  BOOKMARK BUTTON
            if( event.target.id === "button_bookmark"){
                const method = isBookmarked ? 'DELETE' : 'POST';
                request_bookmark(method);
            }
        });

        init_bookmark();
    }

})();

