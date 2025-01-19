// js/forum_detail_filter.js


function update_queryString(param,value){
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (value){
        params.set(param,value);

    } else {
        params.delete(param);
    }

    window.location.href = url.toString();
}


document.addEventListener('click',function(event){

    const filter_classes = ['newest_order','oldest_order','view_count_order','comment_count_order'];

    if(event.target.classList.contains('filter_button')){
        const parent_div = event.target.closest('.filter_div');
        if(parent_div.querySelector('.filter_modal').style.display === "flex" ){
            parent_div.querySelector('.filter_modal').style.display = "none";
            parent_div.querySelector('.filter_arrow').textContent = "↓";
        }else{
            parent_div.querySelector('.filter_modal').style.display = "flex";
            parent_div.querySelector('.filter_arrow').textContent = "↑";
        }
    }

    if(filter_classes.some(name => event.target.classList.contains(name))){
        const parent_div = event.target.closest('.filter_div');
        parent_div.querySelector('.filter_modal').style.display = "none";
        update_queryString("order", event.target.className);
    }
    

    if(event.target.classList.contains('page_a_button')){
        update_queryString("page",event.target.textContent);
    }

    if(event.target.classList.contains('page_a_button_current')){
        update_queryString("page",event.target.dataset.setting_page);
    }


});


