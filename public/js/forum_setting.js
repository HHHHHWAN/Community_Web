document.getElementById('delete_account_form').addEventListener('submit', (event) => {
    const accept_box = document.getElementById('accept_check');
    if(!accept_box.checked){
        alert('이용약관에 동의가 필요합니다.');
        event.preventDefault();
    } else {
        alert('탈퇴 완료');
    }
});