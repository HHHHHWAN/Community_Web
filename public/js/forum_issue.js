
(function (){
    const list_nav_el = document.querySelector('.list_nav');
    const list_ul_el = document.querySelector('.list_ul');

    // nav button event ( 네비게이션 이벤트 )
    list_nav_el.addEventListener('click', (event) => {
        const target = event.target;
        if( target.classList.contains('nav_btn')){
            const target_el_id = target.id;
            list_nav_el.querySelectorAll('.nav_btn').forEach( row => row.classList.remove('active'));
            target.classList.add('active');
            req_Manage_list(target_el_id);
        }
    });

    // manage list request
    async function req_Manage_list(navStatus){
        try{
            const api_Response = await fetch(`/manage/list?nav=${navStatus}`, {
                headers : {'Accept' : 'application/json'}
            });

            const api_result = await api_Response.json();

            if(!api_Response.ok){
                throw new Error(api_result.message);
            }
            
            const list_array = api_result.data;
            list_ul_el.innerHTML = ``;
            list_array.forEach(list_row => {
                const list_li_el = document.createElement('li');
                list_li_el.innerHTML = `
                    <div class="list_li_div">
                        <div style="display:flex; padding-left : 10px;">
                            <div style=" flex : 1; ">${navStatus === 'manage' ? '수정자' : '요청자'} : ${list_row.manage_nickname} </div>
                            <div style=" display:flex; flex : 1; justify-content: right; ">수정일 : ${list_row.reported_at}</div>
                        </div>
                        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px;"> 
                            <button type="button" 
                                    class="list_detail_button"
                                    data-target_type = "${list_row.target_type}"
                                    data-target_id = "${list_row.target_id}"
                            >
                                ( ${list_row.target_type === 'content' ? '게시글' : '댓글'} ) ${list_row.message}
                            </button>
                        </div>
                        <div class="list_detail_div" 
                            style="
                                display:none;
                                margin: 10px; 
                                padding:10px; 
                                border: 1px solid black;
                                border-radius : 10px;
                                font-size:12px"
                        ></div>
                    </div>
                `;
                list_ul_el.appendChild(list_li_el); 
            });

        }catch(err){
            alert(err.message);
            console.error( err );
        }
    }

    
    // list detail view on/off
    list_ul_el.addEventListener('click', (event) => {
        if(event.target.classList.contains('list_detail_button')){
            const parent_div_el = event.target.closest('.list_li_div');
            const detail_div_el = parent_div_el.querySelector('.list_detail_div');

            const target_id = event.target.dataset.target_id;
            const target_type = event.target.dataset.target_type;

            if (detail_div_el.innerHTML === ''){
                req_manage_detail(
                    {
                        id : target_id,
                        type : target_type
                    },
                    detail_div_el
                );
            }

            const modal_status = detail_div_el.style.display
            detail_div_el.style.display =  modal_status === 'block' ? 'none' : 'block';
        }
    });



    async function req_manage_detail(query_data, el){

        const api_url = '/manage/list/detail'
        const params = new URLSearchParams(query_data)

        try{
            const api_Response = await fetch(`${api_url}?${params.toString()}`, {
                headers : {'Accept' : 'application/json'}
            });

            const api_result = await api_Response.json();

            if(!api_Response.ok){
                throw new Error(api_result.message);
            }

            const api_data = api_result.data;

            const detail_div = document.createElement('div');

            detail_div.innerHTML = query_data.type === 'content' ? `
                작성자 : ${api_data.nickname} <br>
                본문 :
                <div style="margin-left : 10px;">
                    <div style="border-bottom: 1px solid rgb(161, 201, 176);">
                        <h3>${api_data.title}<h3></div><br>
                    <div>${api_data.text}</div>
                </div>
                <div style=""> 
                    <div></div>
                    <div></div>
                </div>
            ` : `
                작성자 : ${api_data.nickname} <br>
                본문 :
                <div style="margin-left : 10px;">
                    <div>${api_data.comment}</div>
                </div>
                <div style=""> 
                    <div></div>
                    <div></div>
                </div>
            `
            el.appendChild(detail_div);

        }catch(err){
            alert(err.message);
            console.error( err );
        }
    }
    req_Manage_list('manage');

})()