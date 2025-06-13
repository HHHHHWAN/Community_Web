
(function (){
    const list_nav_el = document.querySelector('.list_nav');
    const list_ul_el = document.querySelector('.list_ul');

    let currentNav = 'manage';

    // nav button event ( 네비게이션 이벤트 )
    list_nav_el.addEventListener('click', (event) => {
        const target = event.target;
        if( target.classList.contains('nav_btn')){
            const target_el_id = target.id;
            list_nav_el.querySelectorAll('.nav_btn').forEach( row => row.classList.remove('active'));
            target.classList.add('active');
            Rep_Issue_List(target_el_id);
        }
    });

    // issue list request
    async function Rep_Issue_List(navStatus, page = 1){
        currentNav = navStatus;
        try{
            const api_Response = await fetch(`/manage/list?nav=${navStatus}&page=${page}`, {
                headers : {'Accept' : 'application/json'}
            });

            const api_result = await api_Response.json();

            if(!api_Response.ok){
                throw new Error(api_result.message);
            }
            const api_data = api_result.data;
            
            const listArray = api_data.issueList;
            const listCount = api_data.listCount;

            let postCount = ( page - 1 ) * 10  ;

            list_ul_el.innerHTML = ``;
            listArray.forEach(list_row => {
                postCount += 1;
                const list_li_el = document.createElement('li');
                list_li_el.innerHTML = `
                    <div class="list_li_div">
                        <div style="display:flex;">
                            <div style="flex: 1 ; text-align:center; font-weight: bold"> ${postCount} </div>
                            <div style="flex: 13 ;">
                                <div style="display:flex; padding-left : 10px;">
                                    <div style=" flex : 1; ">${navStatus === 'manage' ? '수정자' : '요청자'} : ${list_row.manage_nickname} </div>
                                    <div style=" display:flex; flex : 1; justify-content: right; ">수정일 : ${list_row.reported_at}</div>
                                </div>
                            </div>
                        </div>
                        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px;"> 
                            <button type="button" 
                                    class="list_detail_button"
                                    data-report_id = "${list_row.id}"
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

            Reload_Page(page, listCount)

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

            const report_id = event.target.dataset.report_id;
            const target_id = event.target.dataset.target_id;
            const target_type = event.target.dataset.target_type;

            if (detail_div_el.innerHTML === ''){
                req_manage_detail(
                    {
                        id : target_id,
                        type : target_type,
                        report_id,
                        currentNav
                    },
                    detail_div_el
                );
            }

            const modal_status = detail_div_el.style.display
            detail_div_el.style.display =  modal_status === 'block' ? 'none' : 'block';
        }
    });


    // 리스트 내역
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

            const contentStatus = api_data.visible.data.toString() === '1';
            let commentStatus = false;

            if( api_data.comment_visible ){
                commentStatus = api_data.comment_visible.data.toString() === '1';
            }

            const isIssue_status = query_data.type === 'content' ? contentStatus : commentStatus ;

            const detail_div = document.createElement('div');
            const textdiv = query_data.type === 'content' ? `
                    <div style="border-bottom: 1px solid rgb(161, 201, 176);">
                        <h3>${api_data.title}<h3></div><br>
                    <div class="detail_text">${api_data.text}</div>
                    <div style="text-align: center;">...</div>
            ` : `
                    <div>${api_data.comment}</div>
                    <div style="text-align: center;">...</div>
            `;


            const orginal_url = isIssue_status ? `
                <div><a href='/${api_data.content_type}/${api_data.id}' disable> 본문  이동 </a></div>
            ` : '';

            detail_div.innerHTML = `
                작성자 : ${api_data.nickname} <br>
                상태 : ${  isIssue_status ? '공개': '비공개' } <br>
                본문 :
                <div style="margin-left : 10px;">
                    ${textdiv}
                </div>
                <div> 
                    ${orginal_url}
                    <div class="restore_div"
                        style="display:flex; justify-content:right;"></div>
                </div>
            `;

            const restore_div_el = detail_div.querySelector('.restore_div');
            restore_div_el.innerText = ' 공개 처리 됨';
            if( !isIssue_status ){
                restore_div_el.innerHTML = '';
                const restore_button_el = document.createElement('button');
                restore_button_el.type = 'button';
                restore_button_el.innerText = ' 복구 처리 ';
                restore_Post_event(query_data.type, query_data.id, restore_button_el);
                restore_div_el.appendChild(restore_button_el); 
            }

            const related_list = api_data.relatedReport;

            if ( related_list ){

                let count = 1

                const related_div = document.createElement('legend');
                related_div.innerHTML = `
                    <div style=" border-top : 1px solid black; padding-top : 3px;">
                        <h5>기록</h5>
                    </div>
                `;

                related_list.forEach( row => { 

                    let related_row = document.createElement('div');

                    if( row.id === parseInt(query_data.report_id)){
                        related_row = document.createElement('h4');
                    }

                    related_row.innerHTML = `
                        ${count}.&nbsp;${row.message} // ${row.reported_at}
                    `;

                    count += 1;

                    related_div.appendChild(related_row);
                });
                detail_div.appendChild(related_div);
            }
            
            el.appendChild(detail_div);

        }catch(err){
            alert(err.message);
            console.error( err );
        }
    }

    async function restore_Post_event(targetType, targetId, el){
        el.addEventListener('click', async () => {
            if(!confirm('다시 공개 처리하시겠습니까?')) return;

            try{
                const api_Response = await fetch('/manage/restore',{
                    method : 'PUT',
                    headers : {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        type : targetType,
                        id : targetId
                    })
                });
    
                const api_result = await api_Response.json();
    
                if(!api_result.result){
                    throw new Error (" 처리 결과 : 요청한 대상이 존재하지 않음 ")
                }
    
                alert(" 공개 처리되었습니다.");

                location.reload();
            }catch(err){
                alert(err.message);
                console.error( err );
            }
        });
    }

    Rep_Issue_List('manage'); // default nav

    const page_box = document.getElementById('page_box'); // Define div_el

    /** 페이지 UI 재로드 ( 리스트 카테고리, 현재 페이지, 전체 페이지 수 ) */
    function Reload_Page(currentPage, totalPage ){
    
        // 중앙 페이징 정렬렬
        function set_PageNumber_Button( start , end ){
            for ( let i = start; i <= end ; i++){
                const page_Number = document.createElement('button');
                page_Number.type = 'button';
                page_Number.className = 'page_Button'
                page_Number.innerText = i;

                if( i === currentPage){
                    page_Number.setAttribute('disabled',true);
                    page_Number.setAttribute('color','rgb(128, 175, 152)');   
                }
                page_Center.appendChild(page_Number);
            }
        }
    
        page_box.innerHTML = ''; // page DIV init
    
        //prev 
        const prev_Div = document.createElement('div');
        const prev_Button = document.createElement('button');

        prev_Button.innerText = 'Prev';
        prev_Button.type = 'button';
        prev_Button.dataset.movePage = currentPage - 1;
        prev_Button.className = 'move_Button';

        if( currentPage === 1){
            prev_Button.disabled = true;
        }
        prev_Div.appendChild(prev_Button);
        page_box.appendChild(prev_Div);
    
        // center
        const page_Center = document.createElement('div');
        page_Center.id = 'page_box_center';
        // page_Center.setAttribute('id','page_box_center')
        if(  4 < currentPage  ){ // 1 페이지 출력, 3 페이지 이동
            const first_Page = document.createElement('button');
            const prev_Dot = document.createElement('button');
            first_Page.innerText = '1';
            first_Page.type = 'button';
            first_Page.className = 'page_Button';

            prev_Dot.innerText = '...';
            prev_Dot.type = 'button';
            prev_Dot.className = 'move_Button';
            prev_Dot.dataset.movePage = currentPage - 3;

            page_Center.appendChild(first_Page);
            page_Center.appendChild(prev_Dot);

        } else {
            set_PageNumber_Button(1, Math.min(totalPage,5));
        }
    
        if ( 4 < currentPage && currentPage < totalPage - 3 ){ // 시작, 끝 페이지와 일정 거리가 있는 경우
            set_PageNumber_Button((currentPage - 1), (currentPage + 1));
        }
    
        if( currentPage < totalPage - 3){
            const next_Dot = document.createElement('button');
            const last_Page = document.createElement('button');

            next_Dot.innerText = '...';
            next_Dot.type = 'button';
            next_Dot.className = 'move_Button';
            next_Dot.dataset.movePage = currentPage + 3;
        
            last_Page.innerText = totalPage;
            last_Page.type = 'button';
            last_Page.className = 'page_Button'

            page_Center.appendChild(next_Dot);
            page_Center.appendChild(last_Page);

        }else{
            set_PageNumber_Button(Math.max(6,totalPage - 4), totalPage );
        }
        page_box.appendChild(page_Center);
    
        // next
        const next_Div = document.createElement('div');
        const next_Button = document.createElement('button');

        next_Button.innerText = 'Next';
        next_Button.type = 'button';
        next_Button.dataset.movePage = currentPage + 1;
        next_Button.className = 'move_Button';
        
        if( currentPage === totalPage){
            next_Button.disabled = true;
        }
        next_Div.appendChild(next_Button);
        page_box.appendChild(next_Div);
    }    

    page_box.addEventListener('click', (event) => {
        if( event.target.classList.contains('page_Button')){
            const selectPage = parseInt(event.target.innerText);
            Rep_Issue_List(currentNav, selectPage);
            return;
        }

        if( event.target.classList.contains('move_Button')){
            const selectPage = parseInt(event.target.dataset.movePage);
            Rep_Issue_List(currentNav, selectPage);
        }
    });
})()