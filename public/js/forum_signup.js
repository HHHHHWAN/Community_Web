
(function(){
	const user_csrf_token = document.querySelector('meta[name="csrf_token"]').content;

	const signup_div_el = document.getElementById('signup_input_div');
	const signup_submit_el = document.getElementById('signup_button');

	const check_list = {
		username : { message : "영 대,소문자, 숫자 조합으로 3자 이상 15자 이내로 입력", regax : /^[a-zA-Z0-9]{3,15}$/ },
		email : { message : "이메일 형식 확인", regax : /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
		nickname : { message : "2자 이상 15자 이내로 입력 ( 한, 영, 숫자 조합 )", regax : /^[a-zA-Z0-9가-힣]{2,15}$/ },            
		password : { message : "8자 이상 영 소,대문자 + 숫자 + ( 특수문자 조합 )", regax : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=-]{8,}$/ },        
	};

	let check_point = {
		username : "",
		email : "",
		nickname : "",
		password : "",
		password_check : ""
	};

	const inputs = signup_div_el.querySelectorAll('input');
	const password_input = document.getElementById('password');
	const password_check_input = document.getElementById('password_check'); 

	signup_div_el.addEventListener('input', (event) => {

		signup_submit_el.disabled = true;
		const space_check = Array.from(inputs).every( input => input.value.trim() !== "");
		if(space_check){
			signup_submit_el.disabled = false;
		}
		const error_hint = event.target.nextElementSibling;

		if( event.target.value === ""){
			error_hint.textContent = "";
			return;
		}

		if(event.target.id === 'password_check'){
			Compare_password();
			return;
		}
		
		if(check_list[event.target.id]){
			error_hint.textContent = check_list[event.target.id].message;
			if(check_list[event.target.id].regax.test(event.target.value)){
				error_hint.style.color = 'green';
				check_point[event.target.id] = event.target.value;
			}else{
				error_hint.style.color = 'red';
				check_point[event.target.id] = "";
			}
		}

		if(event.target.id === 'password'){
			Compare_password();
		}

	});

	const Compare_password = () => {
		const error_hint = password_check_input.nextElementSibling;
		
		if( !password_check_input.value ){
			error_hint.textContent = "";
			check_point['password_check'] = "";
			return;
		}


		if(password_input.value === password_check_input.value ){
			error_hint.textContent = "비밀번호 일치";
			error_hint.style.color = 'green';
			check_point['password_check'] = true;
		}else{
			error_hint.textContent = "비밀번호 불일치";
			error_hint.style.color = 'red';
			check_point['password_check'] = "";
		}
	};


	signup_submit_el.addEventListener('click', async (event) => {
		
		const submit_check = Object.values(check_point).every(row => row !== "");
		if(submit_check){
			try{
				const api_response = await fetch(`/signup`,{
					method : 'POST',
					headers : {
						'Accept' : 'application/json',
						'Content-Type' : 'application/json',
						'X-CSRF-Token' : user_csrf_token
					},
					body : JSON.stringify(check_point),
				});

				const api_result = await api_response.json();


				const api_data = api_result.data;

				if(api_data){
					Object.entries(api_data.service_result).forEach( ( [input_name, value] ) => {
						const input_el = document.getElementById(input_name);
						const input_error_el = input_el.nextElementSibling;

						input_error_el.textContent = value;
						input_error_el.style.color = 'red';
					});
					return;
				}
				
				alert(api_result.message);

				window.location.href = '/login';
			}catch(err){
				alert('서버 요청에 실패했습니다. 잠시후 시도해주세요');
			}
			return;
		}

		alert("조건에 맞지않는 정보가 존재합니다. \n다시 확인해주세요.");
	});


})();
