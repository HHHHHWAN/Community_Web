
(function(){
    const login_el = document.getElementById('login_button');
    const login_alert_div_el = document.getElementById('login_alert');
    const user_csrf_token = document.querySelector('meta[name="csrf_token"]').content;
    // const login_alert_el = document.getElementById();

    const submit_login = async (input) =>{
        try{

            const api_Response = await fetch(`/login`,{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                    'X-CSRF-Token' : user_csrf_token
                },
                body : JSON.stringify(input),
            });
            
            const api_result = await api_Response.json();

            const api_data = api_result.data;

            if(api_result.result){
                window.location.href = `${api_data.returnURL}`;
                return
            }

            login_alert_div_el.style.display = 'block';
            login_alert_div_el.textContent = api_result.message;

        }catch(err){
            console.error(err);
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
        }
    };

    login_el.addEventListener('click', (event) => {
        const Check_foam = [
            { id: 'username', errorspan: 'error_id', message: '아이디를 입력해주세요' },
            { id: 'password', errorspan: 'error_pw', message: '비밀번호를 입력해주세요' }            
        ]
        
        const regax = /^\s*$/; //공백
        let foam_check = true;
        let input = {};

        Check_foam.forEach(row => {
            const error_span = document.getElementById(row.errorspan);
            const input_el = document.getElementById(row.id);

            if( regax.test(input_el.value) ){
                error_span.textContent = row.message;
                foam_check = false;
            } else {
                input[row.id] = input_el.value;
                error_span.textContent = '';
            }
        });

        if(foam_check){
            submit_login(input);
        }
    });
})();



