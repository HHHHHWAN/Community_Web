
const set_setting_config_event = async () => {
    const submit_button_object = document.getElementById('change_password_button');
    const password_div_object = document.getElementById('setting_password_form');

    const current_password_object = document.getElementById('current_password');
    const new_password_object = document.getElementById('new_password');
    const check_password_object = document.getElementById('check_password');

    const social_div_object = document.getElementById('setting_social_div');
    

    const social_put = async (social) => {
        console.log(social);
        try{
            const response = await fetch(`/api/settings/social` , {
                method : 'PUT',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                },
                body : JSON.stringify({
                    social_name : social,
                }),
            });
    
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message);
            }

            alert(data.message);
            location.reload();

        }catch(err){
            alert(err);
            location.reload();
        }
    }

    social_div_object.addEventListener('click', (event) => {
        if(event.target.tagName === 'BUTTON'){
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
    });

    // password 변경?
    password_div_object.addEventListener('input', (event) => {

        // const current_password_object = document.getElementById('password');
        // const new_password_object = document.getElementById('new_password');
        // const check_password_object = document.getElementById('password');



        if( current_password_object.value 
            && new_password_object.value 
            && check_password_object.value ){
                submit_button_object.disabled = false;
        }else{
            submit_button_object.disabled = true;
        }
        console.log(event.target.value);
        console.log(current_password_object.value );
    });



};

const get_setting_config = async () => {
    try{
        const response = await fetch(`/api/settings`, {
            method : 'GET',
            headers : {
                'Accept' : 'application/json'
            }
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(`사용자 정보 불러오기 실패 :`, data.status , data.err);
        }

        

        config_object.style.background = 'rgb(223, 244, 231)';
        config_object.disabled = true;
        info_object.disabled = false;
        main_object.innerHTML = `
            <div style="width: 100%; font-size: 18px; margin-bottom: 20px;"><b>계정관리</b></div>
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
                    </label>
                </div>
                <div>
                    <label style="font-size: 13px;"> 새로운 비밀번호 확인 
                        <input type="password" name="check_password" id="check_password">
                    </label>
                </div>
            </div>
            <div style="margin-top: 15px;"><button type="button" id="change_password_button" style="width: 50px; height: 30px;" disabled> 저장 </button></div>
            
        `;

        if(data.social_info.key_github){
            document.getElementById('setting_github').disabled = false;
        }
        if(data.social_info.key_naver){
            document.getElementById('setting_naver').disabled = false;
        }

        set_setting_config_event();

    }catch(err){
        console.error(err);
        alert("잘못된 접근입니다.");
    }
};