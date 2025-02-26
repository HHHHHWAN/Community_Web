
document.getElementById('text').innerHTML = document.getElementById('text_input').value;

async function uploadImage() {
    const fileInput = document.getElementById('imageInput');
    if(!fileInput.files.length){
        return;
    }
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);

    const response = await fetch("/image/upload", {
        method: 'POST', 
        headers : {
            'Accept' : 'application/json',
        },
        body: formData 
    });
    const data = await response.json();
    
    const editor = document.getElementById('text');
    const img_path = document.createElement('img');
    img_path.src = `/public${data.filePath}`;
    img_path.alt = `${data.filePath}`;
    img_path.setAttribute('style', 'max-width: 100%;');

    editor.appendChild(img_path);
}

const limitText = ( function(){
    const editableDiv = document.getElementById('text');
    // const maxLength = 21844;  
    const maxLength = 2000;  
    const length_display = document.getElementById('text_length_div');
    
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
})();


document.getElementById('imageInput').addEventListener('change',function(){
    uploadImage();
});


document.getElementById('post_form').addEventListener('submit', function(event){
    document.getElementById('text_input').value = document.getElementById('text').innerHTML;
});
    