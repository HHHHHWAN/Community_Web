// js/forum_detail_comment.js

document.querySelectorAll('.create_subcomment_button').forEach(button => { 
    button.addEventListener('click',function(){
        const sub_comment_div = this.parentElement.nextElementSibling;
        const form_div = sub_comment_div.querySelector('.comment_form');
        
        if(!form_div){
            console.error("form_class unknown");
        }


        if( form_div.children.length === 0 ){
            button.textContent = '- 댓글창 닫기'
            form_div.innerHTML = `
                    <div class='comment_tag' style = "margin-bottom : 5px ;"></div>
                    <textarea class="comment_text" name="comment_text" maxlength="250" wrap="hard" placeholder = '댓글 입력...' oninput="autoheight(this)" required></textarea> 
                    <div style = "display : flex; width : 100%; justify-content : right;"><button type="submit" class="forum_button_2">작성</button></div>
            `;
        } else {
            button.textContent = '+ 댓글 쓰기'
            form_div.innerHTML = '';
        }

    });
});

document.addEventListener('click', function(event){
    if (event.target.classList.contains('comment_edit')){
        const div_comment = event.target.closest('.comment_container');
        const origin = div_comment.innerHTML;
        const comment = div_comment.querySelector('.pre_comment');  
        const comment_id = div_comment.querySelector('.comment_id_hidden').value;
        
        div_comment.innerHTML = `
            <form action='/reply/edit/${comment_id}' method=POST>
                <textarea class="comment_text" name="comment_text" maxlength="250" wrap="hard" placeholder = '댓글 입력...' oninput="autoheight(this)" required></textarea> 
                <div style = "display : flex; width : 100%; justify-content : right;">
                    <button type='button' class="button_comment_cancel">취소</button>
                    <button type='submit' class="button_comment_edit">수정</button>
                </div>
            </form>
        `;
        div_comment.querySelector('.comment_text').textContent = comment.textContent;

        div_comment.querySelector('.button_comment_cancel').addEventListener('click',function() {
            div_comment.innerHTML = origin;
        });
    }


    if(event.target.classList.contains('comment_delete')){
        const comment_id = event.target.closest('.comment_container').querySelector('.comment_id_hidden').value;
        fetch(`/reply/delete` , { 
            method : 'DELETE',
            headers : {
                'Accept' : 'applicaion/json',
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                comment_id
            })
        })
        .then(Response => {
            if(!Response.ok){
                throw new Error('Failed API Request');
            }
            return Response.json();
        })
        .then(data => {
            window.location.reload();
            alert(data.message);
        })
        .catch(error => {
            console.error(error);
            alert('요청 처리 중, 문제가 발생했습니다.');
        });
    }
});



