// forum_main.ejs script file

async function callWeatherApi(lat, lon, city) {
    const weatherBox = document.getElementById('weather_box');

    try{
        const params = {
            lat : lat,
            lon : lon
        };

        if(city){
            params.city = city;
        }

        weatherBox.innerText = '날씨를 불러오는 중';
        
        const query_string = new URLSearchParams(params).toString();
        
        const api_Response = await fetch('/api/weather?' + query_string);

        const api_result = await api_Response.json();
        
        if(!api_Response.ok){
            throw new Error(`fail weather api Connect Status : ${api_result.message} \n`);
        }

        const api_data = api_result.data;

        weatherBox.innerHTML = '';
        const icon = `https://openweathermap.org/img/wn/${api_data.weather[0].icon}@2x.png`;
        weatherBox.innerHTML=`
        <div class="weather_icon">
            <img src="${icon}" class="weather_img" alt="weather icon">
        </div>
        <div class="weather_detail" style="height:100%">
            <div>
                - 지역 
                <div style="text-align: right;" >${api_data.name}</div>
            </div>
            <div>
                - 날씨
                <div style="text-align: right;">${api_data.weather[0].main}</div>
            </div>
            <div>
                - 기온
                <div style="text-align: right;">${(api_data.main.temp - 273.15).toFixed(1)}℃</div>
            </div>
        </div>
        `;

    }catch(err){
        console.error(err);
        weatherBox.innerHTML = `
            <div> 오늘의 날씨를 불러올 수 없어요.. </div>
        `;
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    console.log(position);
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    callWeatherApi(latitude,longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("사용자가 위치 정보 접근을 거부");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("위치 정보를 사용할 수 없음");
            break;
        case error.TIMEOUT:
            console.log("위치 정보를 가져오는 데 시간이 초과");
            break;
        case error.UNKNOWN_ERROR:
            console.log("알 수 없는 오류가 발생");
            break;
    }
    callWeatherApi(37.566381,126.977717,'Seoul');  
}

document.addEventListener('DOMContentLoaded',function(){
    getLocation(); 
});


var currentWidth = window.innerWidth;

window.addEventListener('resize', function(){
    currentWidth = window.innerWidth;
    const scroll_post = document.getElementById('moving_div');
    scroll_post.style.transform = `translateY(0px)`
});


window.addEventListener('scroll', function(){
    if( 768 < currentWidth ){
        const scrollTop = window.scrollY + 80;
        const scroll_post = document.getElementById('moving_div');
        scroll_post.style.transform = `translateY(${scrollTop - scroll_post.offsetTop + 30 }px)`;
    } 
});
