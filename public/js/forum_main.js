// forum_main.ejs script file


function callWeatherApi(lat,lon) {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    .then( Response => {
        if(!Response.ok){
            console.error(`fail weather api Connect Status : ${Response.status}`);
        }
        return Response.json();
    })
    .then( data => {
        const weatherBox = document.getElementById('weather_box');
        weatherBox.innerHTML = '';
        const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherBox.innerHTML=`
        <div class="weather_icon">
            <img src="${icon}" class="weather_img" alt="weather icon">
        </div>
        <div class="weather_detail" style="height:100%">
            <div>
                - 지역 
                <div style="text-align: right;" >${data.name}</div>
            </div>
            <div>
                - 날씨
                <div style="text-align: right;">${data.weather[0].main}</div>
            </div>
            <div>
                - 기온
                <div style="text-align: right;">${(data.main.temp - 273.15).toFixed(1)}℃</div>
            </div>
        </div>
        `;
    })
    .catch(err => {
        console.log(err);
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    callWeatherApi(latitude,longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
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
