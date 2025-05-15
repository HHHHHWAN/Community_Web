( function(){
    const manage_button_el = document.getElementById('post_manage');
    const POST_ID =  manage_button_el.dataset.current_post_id;

    let isProcessing = false;

    // Modal Event
    if(manage_button_el){
        const manage_post_modal_el = document.getElementById('post_manage_modal');
        const comment_div_el = document.querySelector('.forum_detail_comment');

        // POST Modal
        manage_button_el.addEventListener('click', () => {
            const modal_status = manage_post_modal_el.style.display;

            manage_post_modal_el.style.display = modal_status === 'none' ? 'block' : 'none';
        });

        // COMMENT Modal
        comment_div_el.addEventListener('click', (event) => {
            if(event.target.classList.contains('comment_manage')){
                const target = event.target;
                const modal_el = target.nextElementSibling; // event_element

                console.log(modal_el);

                const modal_status = modal_el.style.display;

                if(modal_status === 'none'){
                    modal_el.style.display = 'block';
                    comment_manage_event(modal_el);
                    return;
                }

                modal_el.style.display = 'none';
                return;
            }
        });

        post_manage_event();
    }


    /// Request Event

    function post_manage_event(){
        const delete_el = document.getElementById('post_manage_delete');
        const put_el = document.getElementById('post_manage_put');

        const put_modal_el = document.getElementById('post_manage_put_modal');
        const put_submit_el = document.getElementById('post_manage_put_submit');
        const put_select_el = document.getElementById('put_selected');
        const POST_CATEGORY = put_select_el.dataset.current_category;

        put_select_el.value = POST_CATEGORY; // Select init
        

        // DEL Request
        delete_el.addEventListener('click', async () => {
            if(isProcessing) return;
            isProcessing = true;
            if(!confirm('비공개 처리하시겠습니까?')) return;

            try{
                const api_Response = await fetch('/manage/post',{
                    method : 'DELETE',
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        post_id : POST_ID
                    })
                });

                const api_result = await api_Response.json();

                if(!api_result.result){
                    alert(api_result.message);
                    throw new Error (" 처리 결과 : 요청한 대상이 존재하지 않음 ")
                }

                alert(api_result.message);
                location.href = `/${POST_CATEGORY}`;
            }catch(err){ 
                console.error( err );
            }finally{
                isProcessing = false;
            }
        });

        // PUT Setting Modal
        put_el.addEventListener('click', () => {
            const modal_status = put_modal_el.style.display;
            put_modal_el.style.display = modal_status === 'none' ? 'block' : 'none';
        });

        // PUT Request
        put_submit_el.addEventListener('click', async () => {
            const to_category = put_select_el.value;

            if (to_category === POST_CATEGORY){
                alert(" 현재와 같은 카테고리 입니다.");
                return;
            }

            if(isProcessing) return;
            isProcessing = true;

            try{
                const api_Response = await fetch('/manage/post',{
                    method : 'PUT',
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        post_id : POST_ID,
                        move_category : to_category
                    })
                });

                const api_result = await api_Response.json();

                if(!api_result.result){
                    alert(api_result.message);
                    throw new Error (" 처리 결과 : 요청한 대상이 존재하지 않음 ")
                }

                alert(api_result.message);
                location.href = `/${to_category}/${POST_ID}`;
            }catch(err){ 
                console.error( err );
            }finally{
                isProcessing = false;
            }
        });
    }

    // Comment Manage
    function comment_manage_event(target_el){
        // modal 안에 버튼 comment = id 파악 필요
        const current_comment_id = target_el.dataset.comment_id;
        const del_button_el = target_el.querySelector('.comment_manage_delete');


        del_button_el.addEventListener('click', async () => {

            if(isProcessing) return;
            isProcessing = true;
            if(!confirm('비공개 처리하시겠습니까?')) return;

            try{
                const api_Response = await fetch('/manage/comment',{
                    method : 'DELETE',
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        comment_id : current_comment_id
                    })
                });

                const api_result = await api_Response.json();

                if(!api_result.result){
                    alert(api_result.message);
                    throw new Error (" 처리 결과 : 요청한 대상이 존재하지 않음 ")
                }

                alert(api_result.message);
                location.reload();
            }catch(err){
                console.error( err );
            }finally{
                isProcessing = false;
            }
        });

    }

})()