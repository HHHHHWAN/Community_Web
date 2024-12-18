// // comment load
// function loadcomment(content_id){
//     fetch(`/api/comment/${content_id}`)
//         .then( Response => {
//             if(!Response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return Response.json();
//         })
//         .then( get_data => {
//             const comment_list_ul = document.querySelector('.comment_list_div');
//             get_data.Comment_list.forEach(row => {
//                 const comment_li = document.createElement('li');
//                 comment_li.setAttribute('style' , 'margin-bottom : 10px');
//                 const li_form = document.createElement('div');
//                 //login check
//                 const comment_textarea_value = document.getElementById('comment_text');


//                 comment_li.innerHTML = `
//                     <div style="display : flex; width : 100%">
//                         <div>${ row.nickname }<span><b>&nbsp;·&nbsp;</b></span>${ row.create_at }</div>
//                         <div class></div>
//                     </div>
//                     <div style='margin-bottom : 80px;'><pre class='pre_text'></pre></div>
//                 `;

//                 comment_li.querySelector('.pre_text').textContent = row.comment;

//                 if (comment_textarea_value) {
//                     const li_div = document.createElement('div');
//                     li_div.setAttribute('style','margin-bottom: 15px;');
//                     li_div.innerHTML = `
//                     <button class="create_subcomment_button" style="font-size: 11px; color: #868585; border: none; background-color: white;">+ 댓글 쓰기</button>
//                     `;
//                     comment_li.appendChild(li_div);
//                 }

//                 li_form.innerHTML = `
//                     <div class="create_subcomment_div">
//                         <input type='hidden' name='comment_nickname' value=''>
//                         <form action="/reply/${row.content_id}/${row.id}" method="POST" class="comment_form" >
//                         </form> 
//                     </div>
//                 `;

//                 comment_li.appendChild(li_form);
                

                //reply 
//                 if(row.children.length){
//                     row.children.forEach ( children_row =>{
//                         const reply_ul = document.createElement("ul");
//                         reply_ul.setAttribute("style","margin-left : 30px;");
//                         const reply_li = document.createElement("li");
                        
//                         const reply_user = document.createElement("div");
//                         const reply_form = document.createElement("div");

//                         reply_user.innerHTML = `
//                             <div>${ children_row.nickname }<span><b>&nbsp;·&nbsp;</b></span>${ children_row.create_at }</div>
//                             <div><pre class='pre_text'></pre></div>
//                         `;
//                         reply_user.querySelector('.pre_text').textContent = children_row.comment;
//                         reply_li.appendChild(reply_user);
    
//                         if (comment_textarea_value) {
//                             const reply_user = document.createElement('div');
//                             reply_user.setAttribute('style','margin-bottom: 15px;');
//                             reply_user.innerHTML = `
//                             <button class="create_subcomment_button" style="font-size: 11px; color: #868585; border: none; background-color: white;">+ 댓글 쓰기</button>
//                             `;
//                             reply_li.appendChild(reply_user);
//                         }
        
//                         reply_form.innerHTML = `
//                             <div class="create_subcomment_div">
//                                 <input type='hidden' name='comment_nickname' value='${row.nickname}'>
//                                 <form action="/reply/${row.content_id}/${row.id}" method="POST" class="comment_form" >
//                                 </form> 
//                             </div>
//                         `;
//                         reply_li.appendChild(reply_form);
//                         reply_ul.appendChild(reply_li);
//                         comment_li.appendChild(reply_ul);
//                     });
//                 }
//                 comment_list_ul.appendChild(comment_li);
//             });

//             loadedcomment();
//         })
//         .catch(error => {
//             console.error('error fetching data :', error);
//         });
        
// }