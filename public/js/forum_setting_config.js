
const password_event = async () => {
    const submit_button_el = document.getElementById('change_password_button');
    const password_div_el = document.getElementById('setting_password_form');
    
    
    const inputs = password_div_el.querySelectorAll('input');
    const current_password_el= document.getElementById('current_password');
    const new_password_el= document.getElementById('new_password');
    const check_password_el= document.getElementById('check_password');
    const check_hint_el = document.getElementById('check_password_hint');

    const regex_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=-]{8,}$/;

    let check_point = {
        new_password : false,
        check_password : false
    };

    const password_check = () => {
        if((new_password_el.value === check_password_el.value)){
            check_hint_el.textContent = '일치';
            check_hint_el.style.color = 'green';
            check_point["check_password"] = true;
            return;
        }
        check_hint_el.textContent = '불일치';
        check_hint_el.style.color = 'red'; 
        check_point["check_password"] = false;
    };

    password_div_el.addEventListener('input', (event) => {

        const input_hint_el = event.target.nextElementSibling;
        submit_button_el.disabled = true;
        const submit_check = Array.from(inputs).every( input => input.value.trim() !== "");

        if( submit_check ){
            submit_button_el.disabled = false;
        }

        if(input_hint_el){
            input_hint_el.textContent = '';

            if(event.target.value === ""){
                return;
            }
        }
        
        if(event.target.id === 'new_password'){
            password_check();
            input_hint_el.textContent = '※ ( 8자 이상, 영 소,대문자 + 숫자 ) 필수  + 특수문자 조합';

            if ( event.target.value === current_password_el.value){ 
                input_hint_el.textContent = '현재 비밀번호와 동일한 비밀번호';
                check_point[event.target.id] = event.target.value;
                return;
            } 


            if ( regex_password.test(event.target.value) ){ 
                input_hint_el.style.color = 'green';
                check_point[event.target.id] = event.target.value;
                return;
            } 
            input_hint_el.style.color = 'red';
            check_point[event.target.id] = "";
            return;
        }

        if(event.target.id === 'check_password'){
            password_check();
        }
    });

    submit_button_el.addEventListener('click', async () => {

        const submit_check = Object.values(check_point).every(row => row);

        if( submit_check ){
            try{
                const api_Response = await fetch(`/settings/password`,{
                    method : 'PUT',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Accept' : 'application/json',
                        'X-CSRF-Token' : user_csrf_token
                    },
                    body : JSON.stringify({
                        Current_Password : current_password_el.value,
                        New_Password : new_password_el.value
                    }),
                });

                const api_result = await api_Response.json();
                alert(api_result.message);

                if(api_Response.ok){
                    location.reload();
                }
                
            }catch(err){
                console.error(err);
                alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            }

        }else{
            alert("잘못된 조건의 비밀번호입니다.\n다시 확인해주세요.");
        }
    });
};



const social_put = async (social) => {
    try{
        const api_Response = await fetch(`/settings/social` , {
            method : 'PUT',
            headers : {
                'Content-Type' : 'application/json',
                'Accept' : 'application/json',
                'X-CSRF-Token' : user_csrf_token
            },
            body : JSON.stringify({
                social_name : social,
            }),
        });

        const api_result = await api_Response.json();

        if(!api_Response.ok){
            alert(api_result.message);
        }
        
        window.location.href = "/user/settings?nav=config";

    }catch(err){
        console.error(err);
        alert("서버가 혼잡합니다. 잠시후 시도해주세요");
        location.reload();
    }
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

        config_button_el.style.background = 'rgb(223, 244, 231)';
        config_button_el.disabled = true;
        info_button_el.disabled = false;
        main_div_el.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 20px;"><b>계정관리</b></div>
            <div class="setting_social">
                <div class="label_div">&middot; 소셜계정 연동</div>
                <ul id="setting_social_list">
                </ul>
            </div>
            <div>
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
                            <span style="font-size:11px;" id="password_hint"></span>
                        </label>
                        <br>
                        <span style="font-size:11px;" id="password_hint">※ 특수문자 !@#$%^&*()_+=- 사용가능</span>
                    </div>
                    <div>
                        <label style="font-size: 13px;"> 새로운 비밀번호 확인 
                            <input type="password" name="check_password" id="check_password">
                            <span style="font-size:11px;" id="check_password_hint"></span>
                        </label>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <button type="button" id="change_password_button" style="width: 50px; height: 30px;" disabled>
                        변경
                    </button>
                </div>
            </div>
        `;

        const api_data = api_result.data

        const social_list_el = document.getElementById('setting_social_list');

        Object.entries(api_data.social_info).forEach( ([key_social, regist]) => {
            const create_li_el = document.createElement('li');
            const social_name = key_social.slice(4);
            create_li_el.innerHTML = `
            <button type="button" id="${social_name}" ${ regist ? "" : "style='background-color: white;'"}>
                <img src="/public/img/${social_name}-logo.png" style="vertical-align: middle;" width="30px" height="30px pointer-events: none;" alt="${social_name}_logo">
                ${ regist ? "연동해제" : "연동하기"}
            </button>
            `;
            

            social_list_el.appendChild(create_li_el);

            const a_el = document.getElementById(social_name);
            if(parseInt(regist)){
                a_el.addEventListener('click', async (event) => {
                    event.preventDefault();
                    if(confirm('해당 소셜연동을 해제하시겠습니까?')){
                        await social_put(social_name);
                    }
                });
                return;
            }

            a_el.addEventListener('click', async (event) => {
                location.href = `/login/${social_name}?returnUrl=/user/settings`;
            });
        });

        password_event();

    }catch(err){
        console.error(err);
        alert("서버가 혼잡합니다. 잠시후 시도해주세요");
    }
};