
(function(){
    document.getElementById('text').innerHTML = document.getElementById('text_input').value;

    const length_display = document.getElementById('text_length_div');
    const editableDiv = document.getElementById('text');
    const maxLength = 2000;  

    length_display.innerHTML = `${editableDiv.innerText.length}`;

    const updateText = () => {
        if (editableDiv.innerText.length > maxLength) {
            editableDiv.innerText = editableDiv.innerText.substring(0, maxLength);
            placeCaretAtEnd(editableDiv);
            length_display.style.color = 'red';
            editableDiv.style.border = '2px solid red';
        } else {
            length_display.style.color = 'rgba(83, 83, 83, 0.918)';
            editableDiv.style.border = '1px solid black';
        }

        length_display.innerHTML = `${editableDiv.innerText.length}`;
    }

    function placeCaretAtEnd(el) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    editableDiv.addEventListener('input', updateText);
    editableDiv.addEventListener('paste', updateText);

    const fileInput = document.getElementById('imageInput');

    const uploadImage = async () => {
        try{

            if(!fileInput.files.length){
                return;
            }

            const file = fileInput.files[0];

            if(file.size > 5 * 1024 * 1024){
                alert('5MB를 초과하는 파일입니다.');
                return;
            }

            const formData = new FormData();
            formData.append('image', file );
        
            const api_response = await fetch("/post/upload", {
                method: 'POST', 
                headers : {
                    'Accept' : 'application/json',
                    'X-CSRF-Token' : user_csrf_token
                },
                body: formData 
            });
            const api_result = await api_response.json();

            if(!api_result.result){
                alert(api_result.message);
                return;
            }
            
            const editor = document.getElementById('text');
            const img_path = document.createElement('img');
            img_path.src = `/public${api_result.filePath}`;
            img_path.alt = `${api_result.filePath}`;
            img_path.setAttribute('style', 'max-width: 100%;');
        
            editor.appendChild(img_path);

        }catch(err){
            console.error( err || " API 요청 중, 문제가 발생했습니다.")
        }
    };


    document.getElementById('imageInput').addEventListener('change',function(){
        uploadImage();
    });

})();




    