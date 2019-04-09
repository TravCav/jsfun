let total = 0;
let locP = document.getElementById("locP");
let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

let scale = localStorage.getItem("scale") || 2500000;

let locations = [];
let storageLocations = JSON.parse(localStorage.getItem("locations"));
if (storageLocations != null) {
    locations = storageLocations;
}

let drawing = false;


function AddTestData() {
    let nx = locations[0].lat;
    let ny = locations[0].long;
    let ax = 0;
    let ay = 0;
    for (let index = 0; index < 1000; index++) {
        ax += GetRand();
        ay += GetRand();
        nx += ax;
        ny += ay;
        locations.push({
            lat: nx,
            long: ny,
            dt: Date.now()
        });
    }
}

function Scale(amount) {
    scale *= amount;
    localStorage.setItem("scale", scale);
    DrawScreen();
}

function DrawScreen() {

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    centerX = Math.floor(ctx.canvas.width / 2);
    centerY = Math.floor(ctx.canvas.height / 2);

    pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
    const lastPosition = locations[locations.length - 1];
    for (let index = locations.length - 1; index >= 0; index--) {
        const element = locations[index];

        let x = centerX + ((element.long - lastPosition.long) * scale);
        let y = centerY - ((element.lat - lastPosition.lat) * scale);
        PutPixel(x, y);
    }

    ctx.putImageData(pixels, 0, 0);
    GetScore();
}

function GetLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(ShowPosition);
    } else {
        locP.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function GetScore() {
    total = 0;
    let furthest = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };

    const lastPosition = locations[locations.length - 1];
    for (let index = 1, locLen = locations.length; index < locLen; index++) {
        const curr = locations[index];
        const prev = locations[index - 1];
        const dx = curr.long - prev.long;
        const dy = curr.lat - prev.lat;
        const dv = Math.sqrt((dx * dx) + (dy * dy));
        total += dv;

        if ( furthest.left === 0 || furthest.left > curr.long){
            furthest.left = curr.long;
        }
        if ( furthest.right === 0 || furthest.right < curr.long){
            furthest.right = curr.long;
        }
        
        if ( furthest.top === 0 || furthest.top > curr.lat){
            furthest.top = curr.lat;
        }
        if ( furthest.bottom === 0 || furthest.bottom < curr.lat){
            furthest.bottom = curr.lat;
        }
    }

    const longDiff = furthest.left + "  :  " + furthest.right + " " + (furthest.right - furthest.left) * 10000;
    const latDiff = furthest.top + "  :  " + furthest.bottom + " " + (furthest.bottom - furthest.top) * 10000;

    document.getElementById("pointsP").innerHTML = (total * 100).toFixed(2);// + "<br/>" + longDiff + "<br/>" + latDiff;
}

function PutPixel(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (!(
            x < 1 ||
            y < 1 ||
            x > ctx.canvas.width ||
            y > ctx.canvas.height
        )) {
        const i = (x + y * ctx.canvas.width) * 4;
        pixels.data[i] = 255;
        pixels.data[i + 1] = 255;
        pixels.data[i + 2] = 255;
        pixels.data[i + 3] = 255;
        ////} else {
        ////Scale(0.9);
    }
}

function ShowPosition(position) {
    locP.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
    let lastLoc = locations[locations.length - 1];

    if (locations.length === 0 || (position.coords.latitude !== lastLoc.lat && position.coords.longitude !== lastLoc.long)) {
        locations.push({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            dt: Date.now()
        });
        let jsonLoc = JSON.stringify(locations);
        localStorage.setItem("locations", jsonLoc);
    }

    AddTestData();

    DrawScreen();

}

function GetRand() {
    return (Math.random() - .5) * .0000001;
}

DrawScreen();
GetLocation();