const get_setting_config = async ( ) => {

    try{

        const response = await fetch(`/api/settings`);

        if(!response.ok){
            const result = await response.json();
            throw new Error(`사용자 정보 불러오기 실패 :`, result.status , result.err);
        }

        const data = await response.json();

        config_object.style.background = 'rgb(223, 244, 231)';
        config_object.disabled = true;
        info_object.disabled = false;
        main_object.innerHTML = `
            <div style="width: 100%; font-size: 18px; margin-bottom: 20px;"><b>계정관리</b></div>
            <div class="setting_social">
                <div class="label_div">&middot; 소셜연동 제거</div>
                <div style="margin-bottom: 5px;"><button type="button" id="setting_github" disabled>GitHub</button> </div>
                <div><button type="button" id="setting_naver" disabled>Naver</button> </div>
            </div>
            
            <form>
                <div class="label_div">&middot; 비밀번호 변경 </div>
                <div style="margin-bottom: 20px;">
                    <label style="font-size: 13px;">현재 비밀번호
                        <input type="password" name="passoword" id="passoword" required>
                    </label>
                </div>

                <div>
                    <label style="font-size: 13px;">새로운 비밀번호 
                        <input type="password" name="new_passoword_check" required>
                    </label>
                </div>
                <div>
                    <label style="font-size: 13px;"> 새로운 비밀번호 확인 
                        <input type="password" name="new_passoword" required>
                    </label>
                </div>

                <div> </div>

                <div style="margin-top: 15px;"><button type="button" style="width: 50px; height: 30px;" disabled> 저장 </button></div>
            </form>
        `;

        if(data.social_info.key_github){
            document.getElementById('setting_github').disabled = false;
            // document.getElementById('setting_github').removeAttribute("disabled");
        }
        if(data.social_info.key_naver){
            document.getElementById('setting_naver').disabled = false;
            // document.getElementById('setting_naver').removeAttribute("disabled");
        }

    }catch(err){
        console.error(err);
        alert("잘못된 접근입니다.");
    }
};