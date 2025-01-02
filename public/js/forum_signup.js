
//foam 전송 submit 처리시  function 실행 
document.getElementById('signin').addEventListener('submit' , function(event){  
	// 체크 폼 항목 
	const Check_foam = [
		{ id: 'username', errorspan: 'error_id', massage: '아이디를 입력해주세요' },
		{ id: 'email', errorspan: 'error_email', massage: '이메일을 입력해주세요' },            
		{ id: 'nickname', errorspan: 'error_nk', massage: '닉네임을 입력해주세요' },            
		{ id: 'password', errorspan: 'error_pw', massage: '비밀번호를 입력해주세요' },            
		{ id: 'password_check', errorspan: 'error_pwc', massage: '비밀번호 확인을 입력해주세요' },            
	]

	let foam_check = true;

	const username = document.getElementById('username').value;
	const nickname = document.getElementById('nickname').value;
	const password = document.getElementById('password').value;
	const password_check = document.getElementById('password_check').value;

	const regex_username = /^[a-zA-Z0-9]{3,15}$/; // 대, 소문자 숫자 조합 최소 길이 3자, 최대길이 15자
	const regex_nickname = /^.{2,15}$/; // 2자 이상 15이하
	const regex_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+=-]{8,}$/;
										// 소문자, 대문자, 특수문자 (!@#$%^&*()_+=-) 하나씩 포함하여 8 자 이상
	
	Check_foam.forEach( row => {
		const error_span = document.getElementById(row.errorspan);
		
		if ( !document.getElementById(row.id).value ){
			error_span.textContent = row.massage;
			foam_check = false;
		} else {
			error_span.textContent = '';
		}
	});

	if ( !(password === password_check)){
		document.getElementById('error_pwc').textContent = "확인 비밀번호가 불일치합니다.";
		foam_check = false;
	}

	if ( !(regex_username.test(username)) ){
		document.getElementById('error_id').textContent = "대, 소문자, 숫자 조합으로 3자 이상 15자 이내로 입력";
		foam_check = false;
	}

	if ( !(regex_nickname.test(nickname)) ){
		document.getElementById('error_nk').textContent = "2자 이상 15자 이내로 입력";
		foam_check = false;
	}

	if ( !(regex_password.test(password)) ){
		document.getElementById('error_pw').textContent = "8자 이상 영소문자 + 숫자 + 특수문자 조합";
		foam_check = false;
	}

	!foam_check && event.preventDefault();
});