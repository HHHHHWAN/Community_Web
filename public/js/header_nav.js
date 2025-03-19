
const header_nav_setting = ( function () {
    const mobile_nav_box = document.querySelector('.modal_nav_button_div');
    const mobile_user_box = document.querySelector('.modal_user_button_div');
    const mobile_search_box = document.querySelector('.modal_search_button_div');
    const pc_user_box = document.querySelector('.modal_pc_button_div');

    const modal_button_list = ['modal_nav_button','modal_search_button','modal_user_button', 'modal_pc_button'];

    const header_object = document.querySelector('.head_body');

    window.addEventListener('resize', function(){
        mobile_search_box.setAttribute('style','display: none;');
        mobile_user_box.setAttribute('style','display: none;');
        mobile_nav_box.setAttribute('style','display: none;');
    });  

    function close_menu(event, modal_content){
        const modal_div = document.querySelector(modal_content);
        if(modal_div.style.display === "block"){
            if(!event.target.closest(modal_content)){
                modal_div.style.display = 'none';
                document.removeEventListener('click', close_menu);
            }
        }
    }

    async function logout_request(){
        try{
            const api_response = await fetch('/logout', {
                method : 'DELETE',
                headers : {
                    'Accept' : 'application/json',
                },
            });

            const data = await api_response.json();

            alert(data.message);

            window.location.href = `/`;
        }catch(err) {
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            window.location.href = `/`;
        }
    }



    header_object.addEventListener('click', function(event){
        const event_id = event.target.id;

        if(modal_button_list.some(name => name === event_id)){
            const modal_content = '.' + event_id + '_div'
            const parent_div = event.target.closest('.head_body');

            if(parent_div.querySelector(modal_content).style.display === 'block' ){
                parent_div.querySelector(modal_content).style.display = 'none';
            }else{
                mobile_search_box.style.display = 'none';
                mobile_user_box.style.display = 'none';
                mobile_nav_box.style.display = 'none';
                pc_user_box.style.display = 'none';
                parent_div.querySelector(modal_content).style.display = 'block';
                
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

        if(event.target.classList.contains('logout')){
            logout_request();
        }
    
    });
    
})();






