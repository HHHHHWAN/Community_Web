window.addEventListener('resize', function(){
    const mobile_search_box = document.querySelector('.head_mobile_ctl_search');
    const mobile_user_box = document.querySelector('.head_mobile_ctl_user');
    const mobile_nav_box = document.querySelector('.head_mobile_nav');

    mobile_search_box.setAttribute('style','display: none;');
    mobile_user_box.setAttribute('style','display: none;');
    mobile_nav_box.setAttribute('style','display: none;');

});  

document.addEventListener('click',function(event){

    if(event.target.classList.contains('mobile_nav_button')){
        const parent_div = event.target.closest('.head_body');
        if(parent_div.querySelector('.head_mobile_nav').style.display === "block" ){
            parent_div.querySelector('.head_mobile_nav').style.display = "none";
        }else{
            parent_div.querySelector('.head_mobile_nav').style.display = "block";
        }
    }

    if(event.target.classList.contains('mobile_search_button') || event.target.classList.contains('search_cancel_button') ){
        const parent_div = event.target.closest('.head_body');
        if(parent_div.querySelector('.head_mobile_ctl_search').style.display === "block" ){
            parent_div.querySelector('.head_mobile_ctl_search').style.display = "none";
        }else{
            parent_div.querySelector('.head_mobile_ctl_search').style.display = "block";
        }
    }

    if(event.target.classList.contains('mobile_user_button')){
        const parent_div = event.target.closest('.head_body');
        if(parent_div.querySelector('.head_mobile_ctl_user').style.display === "block" ){
            parent_div.querySelector('.head_mobile_ctl_user').style.display = "none";
        }else{
            parent_div.querySelector('.head_mobile_ctl_user').style.display = "block";
        }
    }

    if(event.target.classList.contains('login_href')){
        const href_object = event.target.closest('.login_href');
        const login_path = `/login`;
        const login_path_object = {
           returnUrl : window.location.pathname,
        }
        
        const param = new URLSearchParams(login_path_object).toString();

        href_object.setAttribute('href',`${login_path}?${param}`);
    }

    if(event.target.classList.contains('signup_href')){
        const href_object = event.target.closest('.signup_href');
        const signup_path = `/signup`;
        const signup_path_object = {
           returnUrl : window.location.pathname,
        }
        
        const param = new URLSearchParams(signup_path_object).toString();

        href_object.setAttribute('href',`${signup_path}?${param}`);
        
    }

    

});

