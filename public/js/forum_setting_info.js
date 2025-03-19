
const set_setting_info_event = (current_nickname) => {
    const name_input_object = document.getElementById('nickname_input');
    const name_button_object = document.getElementById('nickname_button');
    const name_hint_object = document.getElementById('nickname_hint');

    name_input_object.placeholder = current_nickname;

    name_input_object.addEventListener('input', () => {
        if(!name_input_object.value){
            name_button_object.disabled = true;
        }else{
            name_button_object.disabled = false;
        }
    });


    name_button_object.addEventListener('click', async (event) => {
        const regex_nickname = /^[a-zA-Z0-9가-힣]{2,15}$/; // 대, 소문자 숫자 조합 최소 길이 3자, 최대길이 15자

        if(!regex_nickname.test(name_input_object.value)){
            name_hint_object.style.color='red';
            alert('올바른 조건으로 다시 입력해주세요.');
            return event.preventDefault();
        }
        
        if(current_nickname === name_input_object.value){
            name_hint_object.style.color='red';
            alert('현재 사용중인 닉네임입니다.');
            return event.preventDefault();
        }

        try{
            const api_Response = await fetch(`/settings/nickname`,{
                method : 'PUT',
                headers : {
                    'Content-type' : 'application/json',
                    'Accept' : 'application/json',
                },
                body : JSON.stringify({
                    nickname_input : name_input_object.value,
                }),
            });

            const data = await api_Response.json();

            alert(data.message);
            location.reload();
        }catch(err){
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            location.reload();
        }
    });
};




const get_setting_info = async ( current_nickname ) => {
    
    try{
        const api_Response = await fetch(`/settings/info`,{
            method:"GET",
            headers : {
                'Accept' : 'application/json',
            }
        });

        const api_result = await api_Response.json();

        if(!api_Response.ok){
            alert(api_result.message);
            return
        }


        info_object.disabled = true;
        config_object.disabled = false;
        info_object.style.background = 'rgb(223, 244, 231)';

        main_object.innerHTML = `
                <div style="width: 100%; font-size: 18px; margin-bottom: 20px;"><b>회원정보</b></div>
                
                <div>
                    <div class="label_div">&middot; 아이디 </div>
                    <div id="user_info_id" style="color: rgba(120, 117, 117, 0.814); margin-left:5px">&nbsp;</div>
                </div>
    
                <div>
                    <div class="label_div">&middot; 이메일 </div>
                    <div id="user_info_email" style="color: rgba(120, 117, 117, 0.814); margin-left:5px">&nbsp;</div>
                </div>
                <div>
                    <div class="label_div">&middot; 닉네임 변경</div>
                    <input id="nickname_input" name="nickname_input" required >
                    <span style="font-size:11px" id="nickname_hint">※ 공백 특수문자를 제외한, 2자 이상, 15자 이하 영어, 한글 문자 <span>
                </div>
                
                <div style="margin-top: 15px;"><button type="button" id="nickname_button" style="width: 50px; height: 30px;" disabled> 변경 </button></div>
            `;

        const api_data = api_result.data;

        document.getElementById('user_info_id').textContent = api_data.setting_username;
        document.getElementById('user_info_email').textContent = api_data.setting_email;

        set_setting_info_event(current_nickname);

    }catch(err){
        alert("서버가 혼잡합니다. 잠시후 시도해주세요");
    }


};