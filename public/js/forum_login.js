

document.querySelector('.login').addEventListener('submit', function(event) {
    // 체크 폼 항목 
    const Check_foam = [
        { id: 'username', errorspan: 'error_id', massage: '아이디를 입력해주세요' },
        { id: 'password', errorspan: 'error_pw', massage: '비밀번호를 입력해주세요' }            
    ]

    let foam_check = true;

    //Check_foam 반복
    Check_foam.forEach( row => {
        //span id취득 
        error_span = document.getElementById(row.errorspan);

        // username input value 값 공백 확인 
        if( !document.getElementById(row.id).value ){
            error_span.textContent = row.massage;
            foam_check = false;
        } else {
            // 체크 문제 없을 시 error span 공백 
            error_span.textContent = '';
        }

    });

    //foam_check 확인 후 foam 이행
    !foam_check && event.preventDefault();
});

