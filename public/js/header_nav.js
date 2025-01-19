window.addEventListener('resize', function(){
    const mobile_search_box = document.querySelector('.head_mobile_ctl_search');
    const mobile_user_box = document.querySelector('.head_mobile_ctl_user');
    const mobile_nav_box = document.querySelector('.modal_nav_button_div');

    mobile_search_box.setAttribute('style','display: none;');
    mobile_user_box.setAttribute('style','display: none;');
    mobile_nav_box.setAttribute('style','display: none;');

});  

document.addEventListener('click',function(event){
    const event_id = event.target.id;
    const modal_button_list = ['modal_nav_button','modal_search_button','modal_user_button'];

    // test 
    if(modal_button_list.some(name => event_id)){
        const modal_content = '.' + event_id + '_div'
        const parent_div = event.target.closest('.head_body');
        console.log(modal_content);

        if(parent_div.querySelector(modal_content).style.display === "block" ){
            parent_div.querySelector(modal_content).style.display = "none";
        }else{
            parent_div.querySelector(modal_content).style.display = "block";
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

