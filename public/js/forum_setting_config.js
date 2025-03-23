
const set_setting_config_event = async () => {
    const submit_button_object = document.getElementById('change_password_button');
    const password_div_object = document.getElementById('setting_password_form');
    const social_div_object = document.getElementById('setting_social_div');
    
    const current_password_object = document.getElementById('current_password');
    const new_password_object = document.getElementById('new_password');
    const check_password_object = document.getElementById('check_password');
    const regex_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=-]{8,}$/;


    const social_put = async (social) => {
        try{
            const api_Response = await fetch(`/settings/social` , {
                method : 'PUT',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                },
                body : JSON.stringify({
                    social_name : social,
                }),
            });
    
            const api_result = await api_Response.json();


            alert(api_result.message);
            location.reload();

        }catch(err){
            console.error(err);
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            location.reload();
        }
    }

    social_div_object.addEventListener('click', (event) => {
        if(event.target.tagName === 'BUTTON'){
            if(confirm('해당 소셜연동을 해제하시겠습니까?')){
                switch(event.target.textContent){
                    case 'GitHub' :
                        social_put('github');
                        break;
                    case 'Naver' :
                        social_put('naver');
                        break;
                    default :
                        alert('잘못된 접근입니다.');
                }
            }
        }
    });

    const new_password_hint_object = document.getElementById('password_hint');
    const check_password_hint_object = document.getElementById('check_password_hint');

    password_div_object.addEventListener('input', (event) => {

        submit_button_object.disabled = true;
        check_password_hint_object.textContent = '';

        if( current_password_object.value 
            && new_password_object.value 
            && check_password_object.value ){
                submit_button_object.disabled = false;
        }

        if(event.target.id === 'new_password' 
            && regex_password.test(new_password_object.value)){
            new_password_hint_object.style.color = 'green'; 
        }else if (event.target.id === 'new_password'){
            new_password_hint_object.style.color = 'red';
        }

        if(event.target.id === 'check_password'
            && (new_password_object.value === check_password_object.value)){
            check_password_hint_object.textContent = '일치';
            check_password_hint_object.style.color = 'green';     
        }else if(event.target.id === 'check_password'){
            check_password_hint_object.textContent = '불일치';
            check_password_hint_object.style.color = 'red'; 
        }
        
    });

    submit_button_object.addEventListener('click', async (event) => {
        if(new_password_object.value === check_password_object.value
            && regex_password.test(new_password_object.value)){
            
            try{

                const api_Response = await fetch(`/settings/password`,{
                    method : 'PUT',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Accept' : 'application/json',
                    },
                    body : JSON.stringify({
                        Current_Password : current_password_object.value,
                        New_Password : new_password_object.value
                    }),
                });

                const api_result = await api_Response.json();

                alert(api_result.message);
                location.reload();
            }catch(err){
                console.error(err);
                alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            }

        }else{
            alert("올바르지 않은 비밀번호입니다.");
        }
    });

};

const get_setting_config = async () => {
    try{

        const api_Response = await fetch(`/settings/config`, {
            method : 'GET',
            headers : {
                'Accept' : 'application/json'
            }
        });

        const api_result = await api_Response.json();

        if(!api_Response.ok){
            alert(api_result.message);
            return
        }

        config_object.style.background = 'rgb(223, 244, 231)';
        config_object.disabled = true;
        info_object.disabled = false;
        main_object.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 20px;"><b>계정관리</b></div>
            <div class="setting_social">
                <div class="label_div">&middot; 소셜연동 제거</div>
                <div id="setting_social_div">
                    <div style="margin-bottom: 5px;">
                        <button type="button" id="setting_github" disabled>GitHub</button>
                    </div>
                    <div>
                        <button type="button" id="setting_naver" disabled>Naver</button>
                    </div>  
                </div>
            </div>
            
            <div id="setting_password_form">
                <div class="label_div">&middot; 비밀번호 변경 </div>
                <div style="margin-bottom: 20px;">
                    <label style="font-size: 13px;">현재 비밀번호
                        <input type="password" name="current_password" id="current_password">
                    </label>
                </div>
                <div>
                    <label style="font-size: 13px;">새로운 비밀번호 
                        <input type="password" name="new_password"  id="new_password">
                        <span style="font-size:11px;" id="password_hint">※ ( 8자 이상, 영 소,대문자 + 숫자 ) 필수  + 특수문자 조합 </span><br>
                        <span style="font-size:11px;" id="password_hint">※ 특수문자 !@#$%^&*()_+=- 사용가능</span>
                    </label>
                </div>
                <div>
                    <label style="font-size: 13px;"> 새로운 비밀번호 확인 
                        <input type="password" name="check_password" id="check_password">
                        <span style="font-size:11px;" id="check_password_hint"></span>
                    </label>
                </div>
            </div>
            <div style="margin-top: 15px;"><button type="button" id="change_password_button" style="width: 50px; height: 30px;" disabled> 저장 </button></div>
            
        `;



        const api_data = api_result.data

        if(api_data.social_info.key_github){
            document.getElementById('setting_github').disabled = false;
        }
        if(api_data.social_info.key_naver){
            document.getElementById('setting_naver').disabled = false;
        }

        set_setting_config_event();

    }catch(err){
        console.log(err);
        alert("서버가 혼잡합니다. 잠시후 시도해주세요");
    }
};