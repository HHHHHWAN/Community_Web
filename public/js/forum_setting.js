const main_div_el = document.getElementById('setting_box_main');
const info_button_el = document.getElementById('setting_info_button');
const config_button_el = document.getElementById('setting_config_button');
// const user_csrf_token = document.querySelector('meta[name="csrf_token"]').content;

( function(){

    const logout_request = async () => {
        try{
            const api_response = await fetch('/logout', {
                method : 'DELETE',
                headers : {
                    'Accept' : 'application/json',
                    'X-CSRF-Token' : user_csrf_token
                },
            });

            const data = await api_response.json();

            window.location.href = `/`;
        }catch(err) {
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            window.location.href = '/';
        }
    }
    
    const request_signout = async () => {

        try{
            const api_Response = await fetch(`/signout`,{
                method : 'DELETE',
                headers : {
                    'Accept' : 'application/json',
                    'X-CSRF-Token' : user_csrf_token
                }
            });

            const api_result = await api_Response.json();

            alert(api_result.message);
            
            logout_request();

        }catch(err){
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            location.reload();
        }
    };

    document.querySelector('.delete_button').addEventListener('click', (event) => {
        const accept_box = document.getElementById('accept_check');
        if(accept_box.checked){
            if(confirm('정말로 탈퇴하시겠습니까?\n탈퇴신청된 아이디는 복구되지 않습니다.')){
                request_signout();
            }
        } else {
            alert('이용약관에 동의가 필요합니다.');
        }
    });

    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    if(params.get('nav') === 'config'){
        get_setting_config();
    }else{
        get_setting_info();
    }
    
    const nav_div_el = document.getElementById('setting_nav');
    
    nav_div_el.addEventListener('click', (event)=>{
        if(event.target.tagName === 'BUTTON'){
            main_div_el.innerHTML = ``;
            config_button_el.style.background = '';
            info_button_el.style.background = '';
        }
            
        if(event.target.id === 'setting_info_button'){
            get_setting_info();
        }
        
        if(event.target.id === 'setting_config_button'){
            get_setting_config();
        }
    });
    

}())

