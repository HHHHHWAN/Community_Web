// js/forum_detail_comment.js

(function () {

    const comment_main_div_el = document.querySelector('.forum_detail_comment');
    const comment_edit_box_el = document.querySelector('.comment_box');
    const current_content_id = comment_edit_box_el.querySelector('.comment_box_content_id').value;

    const comment_div_placeholder = (el) => {
        function comment_box_check(){
            if (el.innerText.trim() === ''){
                el.classList.add("placeholder");
                el.innerText = "댓글을 입력하세요...";
            }
        }

        el.addEventListener('focus', () => {
            if (el.classList.contains("placeholder")) {
                el.classList.remove("placeholder");
                el.innerText = "";
            }
        });
        el.addEventListener('blur', comment_box_check());
        comment_box_check();
    };

    const comment_submit_setting =  ( el, input ) => {
        const comment_text_el = el.querySelector('.comment_text');
        const comment_submit_el = el.querySelector('.comment_submit');
        
        comment_div_placeholder(comment_text_el);

        comment_submit_el.addEventListener('click', async () => {
            const check_text = comment_text_el.textContent;
            const regax = /^\s*$/;
            if(regax.test(check_text)){
                alert("내용을 입력해주세요");
                return;
            }

            comment_submit_el.disabled = true;
            input.text = comment_text_el.innerHTML;
            input.content_id = current_content_id;

            try{
                // ADD, PUT
                const api_response = await fetch(input.endpoint_value, {
                    method : input.method_value,
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify(input)
                });

                const data = await api_response.json();

                if(!data.result){
                    alert(data.message);
                }

                window.location.reload();
            }catch(err){
                console.error("Fetch Error : ", err);
                alert("처리 중 오류가 발생했습니다.");
                window.location.reload();
            }
        });
    };

    comment_submit_setting( comment_edit_box_el, {
        method_value : 'POST', 
        endpoint_value : `/reply/edit`
    });

    comment_main_div_el.addEventListener('click', function(event){
        // EDIT MODAL
        if (event.target.classList.contains('create_subcomment_button')){
            const button_el = event.target;
            const sub_comment_div = button_el.parentElement.nextElementSibling;
            const form_div = sub_comment_div.querySelector('.comment_form');
            const tag_name_value = sub_comment_div.querySelector('.comment_parent_nickname').value;
            const parent_id_value = sub_comment_div.querySelector('.comment_parent_id').value;
            
            if( form_div.children.length === 0 ){
                button_el.textContent = "- 댓글창 닫기";

                form_div.innerHTML = `
                <div class="comment_text" contenteditable="true" 
                    aria-required="true" aria-multiline="true" 
                    spellcheck="true"><span contenteditable="false" style="width:auto; color: green;
                    font-weight:bold; font-size:11px; padding:5px;">#${tag_name_value}</span>
                </div>
                <div style = "display: flex; width: 100%; justify-content: right; margin-bottom:10px">
                    <button type="button" class="comment_submit">작성</button>
                </div>
                `;

                const input_value = {
                    endpoint_value : `/reply/edit`,
                    method_value : 'POST',
                    parent_id : parent_id_value
                };
    
                comment_submit_setting( form_div, input_value );
            } else {
                button_el.textContent = '+ 댓글 쓰기'
                form_div.innerHTML = '';
            }
        };

        // MODIFY
        if (event.target.classList.contains('comment_modify')){
            const form_div = event.target.closest('.comment_container');
            const origin_div_html = form_div.innerHTML;
            const comment_pre_el = form_div.querySelector('.pre_comment');  
            const comment_id_value = form_div.querySelector('.comment_id_hidden').value;
            
            
            form_div.innerHTML = `
                <div class="comment_text"
                     contenteditable="true" aria-required="true" 
                     placeholder="댓글 작성 ..." aria-multiline="true" 
                     spellcheck="true"></div>
                <div style = "display : flex; width : 100%; justify-content : right;">
                    <button type='button' class="comment_cancel">취소</button>
                    <button type='submit' class="comment_submit">수정</button>
                </div>
            `;

            if(comment_pre_el.querySelector('span')){
                comment_pre_el.querySelector('span').setAttribute('contenteditable','false');
            }
            
            form_div.querySelector('.comment_text').innerHTML = comment_pre_el.innerHTML;

            const input_value = {
                endpoint_value : `/reply/update`,
                method_value : 'PUT',
                comment_id : comment_id_value
            };

            comment_submit_setting( form_div, input_value );
            
            form_div.querySelector('.comment_cancel').addEventListener('click',function() {
                form_div.innerHTML = origin_div_html;
            });
        }

        //DELETE
        if(event.target.classList.contains('comment_delete')){
            if(confirm("댓글을 삭제하시겠습니까?")){
                const target_comment_div_el = event.target.closest('.comment_container');
                const comment_id = target_comment_div_el.querySelector('.comment_id_hidden').value;

                fetch(`/reply/delete` , { 
                    method : 'DELETE',
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        comment_id
                    })
                })
                .then(Response => Response.json())
                .then(data => {
                    alert(data.message);
                    window.location.reload();
                })
                .catch(err => {
                    console.error(err);
                    alert('요청 처리 중, 문제가 발생했습니다.');
                    window.location.reload();
                });
            }
        }
    });

})();



