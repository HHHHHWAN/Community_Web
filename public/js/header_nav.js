
const mobile_nav_box = document.querySelector('.modal_nav_button_div');
const mobile_user_box = document.querySelector('.modal_user_button_div');
const mobile_search_box = document.querySelector('.modal_search_button_div');

const modal_button_list = ['modal_nav_button','modal_search_button','modal_user_button'];


window.addEventListener('resize', function(){
    mobile_search_box.setAttribute('style','display: none;');
    mobile_user_box.setAttribute('style','display: none;');
    mobile_nav_box.setAttribute('style','display: none;');
});  

document.querySelector('.head_body').addEventListener('click', function(event){
    const event_id = event.target.id;

    if(modal_button_list.some(name => name === event_id)){
        const modal_content = '.' + event_id + '_div'
        const parent_div = event.target.closest('.head_body');

        if(parent_div.querySelector(modal_content).style.display === "block" ){
            parent_div.querySelector(modal_content).style.display = "none";
        }else{
            mobile_search_box.setAttribute('style','display: none;');
            mobile_user_box.setAttribute('style','display: none;');
            mobile_nav_box.setAttribute('style','display: none;');
            parent_div.querySelector(modal_content).style.display = "block";
            
            setTimeout(()=>{
                document.addEventListener('click', (event) => close_menu(event, modal_content));
            }, 0 );

            event.stopPropagation();
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

function close_menu(event, modal_content){
    const modal_div = document.querySelector(modal_content);
    if(modal_div.style.display === "block"){
        if(!event.target.closest(modal_content)){
            console.log('test');
            modal_div.setAttribute('style','display: none;');
            document.removeEventListener('click', close_menu);
        }
    }
}


