// js/forum_detail_comment.js

// reply button
function loadedcomment(){
    document.querySelectorAll('.create_subcomment_button').forEach(button => { 
        button.addEventListener('click',function(){
            const sub_comment_div = this.parentElement.nextElementSibling;
            const form_div = sub_comment_div.querySelector('.comment_form');
            // const reply_nickname = sub_comment_div.querySelector("input[name='comment_nickname']").value;
            
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
                // if(reply_nickname){
                //     const reply_nickname_div  = form_div.querySelector('.comment_tag');
                //     reply_nickname_div.innerHTML =`
                //         <span style = "color: rgb(137, 76, 165);">#${reply_nickname}</span>
                //         <input type = 'hidden' name = 'tag_text' value = '#${reply_nickname} + '>
                //     `;
                // }
            } else {
                button.textContent = '+ 댓글 쓰기'
                form_div.innerHTML = '';
            }

        });
    });
};

function editcomment(){
    document.addEventListener('click', function(event){
        if (event.target.classList.contains('comment_edit')){
            const div_comment = event.target.closest('.comment_container');
            const origin = div_comment.innerHTML;
            const comment = div_comment.querySelector('.pre_comment');  
            const comment_id = div_comment.querySelector('.comment_id_hidden').value;
            
            div_comment.innerHTML = `
                <form action='/reply/edit/${comment_id}' method=POST>
                    <textarea class="comment_text" name="comment_text" maxlength="250" wrap="hard" placeholder = '댓글 입력...' oninput="autoheight(this)" required>${comment.textContent}</textarea> 
                    <div style = "display : flex; width : 100%; justify-content : right;">
                        <button type='button' class="button_comment_cancel">취소</button>
                        <button type='submit' class="forum_button_2">작성</button>
                    </div>
                </form>
            `; 

            div_comment.querySelector('.button_comment_cancel').addEventListener('click',function() {
                div_comment.innerHTML = origin;
            });
        }


        if(event.target.classList.contains('comment_delete')){
            const comment_id = event.target.closest('.comment_container').querySelector('.comment_id_hidden').value;
            fetch(`/reply/delete/${comment_id}` , { method : 'DELETE'})
            .then(Response => {
                if(!Response.ok){
                    throw new Error('failed get api');
                }
                
                return Response.json();
            })
            .then(data => {
                window.location.reload();
                alert(data.message);
            })
            .catch(error => {
                console.error('error deletubg data',ReferenceError);
            });
        }
    });


};



