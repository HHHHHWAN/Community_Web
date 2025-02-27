
const submit = (function () {
    const sub_div_object = document.getElementById('submit_div');
    
    async function post_request( input ){
        try{
            const api_response = await fetch( input.endpoint, {
                method : input.method,
                headers : {
                    'Accept' : 'application/json',
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(input)
            });
    
            const data = await api_response.json();

            if(!data.result){
                alert(data.message);
                window.location.href = `/${input.category}`;
                return
            }

            window.location.href = `/${input.category}/${data.post_id}`;

        }catch(err) {
            console.error(err);
            alert("처리 중 오류가 발생했습니다.");
            window.location.href = `/${input.category}`;
        }
    };


    function input_check(input) {
        const regax = /^\s*$/;
        if( regax.test(input.title)){
            alert("제목을 입력해주세요");
            return true;
        }
        if( regax.test(input.text) ){
            alert("내용을 입력해주세요");
            return true;
        }
        return false;
    }


    sub_div_object.addEventListener('click', (event) => {

        const content_value = {
            category : document.getElementById('selected_category').value,
            title : document.getElementById('title').value,
            text : document.getElementById('text').innerHTML,
        }

        if(input_check(content_value)){
            return event.preventDefault(); 
        }

        if( event.target.id === 'put_submit' ){
            content_value.method = 'PUT';
            content_value.endpoint = `/post/update`;
            content_value.post_id = document.getElementById('post_id_hidden').value;
            event.target.disabled = true;
            event.target.textContent = '수정중';
            post_request(content_value);   
        }

        if( event.target.id === 'post_submit' ){
            content_value.method = 'POST';
            content_value.endpoint = `/post/edit`;
            event.target.disabled = true;
            event.target.textContent = '게시중';
            post_request(content_value);       
        }

    });
})();