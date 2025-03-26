
( function(){

    const logout_request = async () => {
        try{
            const api_response = await fetch('/logout', {
                method : 'DELETE',
                headers : {
                    'Accept' : 'application/json',
                },
            });

            const data = await api_response.json();

            window.location.href = `/`;
        }catch(err) {
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            window.location.href = '/';
        }
    }
    
    const request_signout = async () => {

        try{
            const api_Response = await fetch(`/signout`,{
                method : 'DELETE',
                headers : {
                    'Accept' : 'application/json',
                }
            });

            const api_result = await api_Response.json();

            alert(api_result.message);
            
            logout_request();

        }catch(err){
            alert("서버가 혼잡합니다. 잠시후 시도해주세요");
            location.reload();
        }
    };

    document.querySelector('.delete_button').addEventListener('click', (event) => {
        const accept_box = document.getElementById('accept_check');
        if(accept_box.checked){
            if(confirm('정말로 탈퇴하시겠습니까?\n탈퇴신청된 아이디는 복구되지 않습니다.')){
                request_signout();
            }
        } else {
            alert('이용약관에 동의가 필요합니다.');
        }
    });
    
}())



