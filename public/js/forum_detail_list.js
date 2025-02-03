// js/forum_detail_list.js

function page_reload(pagetype, current_Page, total_Count ){
    const page_box = document.getElementById('page_box');

    function page_list( start , end ){
        for ( let i = start; i <= end ; i++){
            const page_number = document.createElement('button');
            if( i === current_Page){
                page_number.setAttribute('disabled',true);
                page_number.setAttribute('color','rgb(128, 175, 152)');
                page_number.innerHTML = `${i}`;
                page_center.appendChild(page_number);
            } else{
                page_number.setAttribute('onclick',`reloadPage('${pagetype}',${i})`);
                page_number.innerHTML = `${i}`;
                page_center.appendChild(page_number);
            }
        }
    }

    page_box.innerHTML = '';

    const prevButton = document.createElement('div');
    if( current_Page === 1){
        prevButton.innerHTML = `<button disabled> Previous </button>`;
    }else {
        prevButton.innerHTML = `<button onclick="reloadPage('${pagetype}',${current_Page - 1 })"> Previous </button>`;
    }
    page_box.appendChild(prevButton);


    const page_center = document.createElement('div');
    page_center.setAttribute('id','page_box_center')
    if( current_Page > 4 ){
        const first_Page = document.createElement('button');
        first_Page.innerHTML = `1`;
        first_Page.setAttribute('onclick',`reloadPage('${pagetype}',1)`);
        page_center.appendChild(first_Page);

        const prev_Dot = document.createElement('button');
        prev_Dot.innerHTML = `...`;
        prev_Dot.setAttribute('onclick',`reloadPage('${pagetype}',${current_Page - 3})`);
        page_center.appendChild(prev_Dot);
    } else{
        page_list(1,Math.min(total_Count,5));
    }

    if ( 4 < current_Page && current_Page < total_Count - 3 ){
        page_list((current_Page - 1),(current_Page + 1));
    }

    if( current_Page < total_Count - 3){
        const next_Dot = document.createElement('button');
        next_Dot.innerHTML = `...`;
        next_Dot.setAttribute('onclick',`reloadPage('${pagetype}',${current_Page + 3})`);
        page_center.appendChild(next_Dot);

        const Last_Page = document.createElement('button');
        Last_Page.innerHTML = `${total_Count}`;
        Last_Page.setAttribute('onclick',`reloadPage('${pagetype}',${total_Count})`);
        page_center.appendChild(Last_Page);
    }else{
        page_list(Math.max(6,total_Count - 4), total_Count );
    }
    

    page_box.appendChild(page_center);

    const nextButton = document.createElement('div');
    if( current_Page === total_Count){
        nextButton.innerHTML = `<button disabled> Next </button>`;
    }else {
        nextButton.innerHTML = `<button onclick="reloadPage('${pagetype}',${current_Page + 1})"> Next </button>`;
    }
    page_box.appendChild(nextButton);
}

// 데이터 반환 api 함수 호출
function reloadPage(pagetype, page){
    fetch(`/api/${pagetype}?page=${page}`)
        .then(Response => {
            if(!Response.ok) {
                throw new Error('Network response was not ok');
            }
            return Response.json();
        })
        .then(data => {
            const contents_list_ul = document.getElementById('content_list');
            contents_list_ul.innerHTML = ''; 

            data.contents.forEach(content_row => {
                const content_list_li = document.createElement('li');
               
                content_list_li.innerHTML = `
                    <div class="forum_list_box_content">
                        <div><span><a class="user_href" href="/user/${content_row.user_id}">${content_row.nickname}</a><b>&nbsp·&nbsp</b>${content_row.date_create}</span></div>
                        <div class="forum_list_box_detail">
                            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <a href="/${content_row.content_type}/${content_row.id}?pagetype=${pagetype}&page=${page}">${content_row.title}</a>
                            </div>
                        </div>
                        <div style="display:flex; width=100%;">
                            <div></div>
                            <div style="display: flex; width: 100%; justify-content: right; font-size: 12px;">
                                <img src="../public/img/comment-icon.png" width="11px" style="object-fit:contain;">&nbsp;${content_row.comment_count ? content_row.comment_count : 0}
                                &nbsp;<span><b>·</b></span>&nbsp;
                                <img src="../public/img/eye-icon.png" width="11px" style="object-fit:contain;">&nbsp;${content_row.view_count}
                            </div>
                        </div>
                    </div>
                `;
                contents_list_ul.appendChild(content_list_li); 
            });
            // 페이지 업데이트
            page_reload(pagetype, data.page, data.totalPages);
        })
        .catch(error => {
            console.error('error fetching data :', error);
            const contents_list_ul = document.getElementById('content_list');
            contents_list_ul.innerHTML = ' 데이터를 불러오는데, 실패했습니다. ';
        });
}



