
(function(){
    const login_el = document.getElementById('login_button')

    const submit_login = async (input) =>{
        try{

            const api_Response = await fetch(`/login`,{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json',
                },
                body : JSON.stringify(input),
            });
            
            const api_result = await api_Response.json();

            const api_data = api_result.data;

            if(api_result.result){
                window.location.href = `${api_data.returnURL}`;
                return
            }

            if(!alert(api_result.message)){
                location.reload();
            }

        }catch(err){
            console.error(err);
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
        }
    };

    login_el.addEventListener('click', (event) => {
        const Check_foam = [
            { id: 'username', errorspan: 'error_id', massage: '아이디를 입력해주세요' },
            { id: 'password', errorspan: 'error_pw', massage: '비밀번호를 입력해주세요' }            
        ]
        
        const regax = /^\s*$/; //공백
        let foam_check = true;
        let input = {};

        Check_foam.forEach(row => {
            const error_span = document.getElementById(row.errorspan);
            const input_el = document.getElementById(row.id);

            if( regax.test(input_el.value) ){
                error_span.textContent = row.massage;
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



