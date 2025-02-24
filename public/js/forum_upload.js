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

document.getElementById('imageInput').addEventListener('change',function(){
    uploadImage();
});

const editableDiv = document.getElementById('text');
const maxLength = 21844;  
const length_display = document.getElementById('text_length_div');

editableDiv.addEventListener('input', function() {
    
    length_display.innerHTML = `${editableDiv.innerText.length}`;

    if (editableDiv.innerText.length > maxLength) {
        
        editableDiv.innerText = editableDiv.innerText.substring(0, maxLength);
    }
});

document.getElementById('post_form').addEventListener('submit', function(event){
    document.getElementById('text_input').value = document.getElementById('text').innerHTML;
});
    