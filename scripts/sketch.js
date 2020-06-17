var device=new tramontana();
var fieldStrength;
var breakTime;
var intevalTime;
var breakAmount;
var startTime;
var elapsedTime;
var isTimeChecking = false;
var deviceType;
var notificationsEnabled = false;
var isDeviceDetermined = false;
var userStatus = "preparing";


function setup() {
	createCanvas(windowWidth, windowHeight);
	initNotifications();
	hideAllButFirstText();
	initSliders();
}

function draw() {
	if (fieldStrength > 1000) {
		alert("Magneet: " + fieldStrength + ". Breaks: " + parseSelectValue() + ". Interval: "+ intervalTime);
	}

	checkBreakTimer();
}

function initSliders(){
	$('#ex1').slider({
		formatter: function(value) {
			breakTime = value;
			return value;
		}
	});

	// slider js
	$('#ex2').slider({
		formatter: function(value) {
			intervalTime = value;
			return value;
		}
	});

	$(".ex1").slider({
		tooltip: 'always'
	});
}

function hideAllButFirstText(){
	$('.init-hide').hide();
}

function startBreakTimer(){
	startTime = new Date();
	isTimeChecking = true;
}
function stopBreakTimer(){
	isTimeChecking = false;
}

function checkBreakTimer(){
	if (Boolean(isTimeChecking)) {
		var currentTime = new Date();
		elapsedTime = (currentTime - startTime)/60000;
		$('#timeTest').html(elapsedTime);
		if (elapsedTime > intervalTime) {
			showNotification();
			stopBreakTimer();
		}
	}
}

//Notification logic below
function initNotifications() {
	if (window.Notification) {
		Notification.requestPermission(function(permission) {
			if (permission === 'granted') {
				notificationsEnabled = true;
			} else {
				alert("You denied Notifications, it's so sad :(");
			}
		});
	} else {
		alert("Your browser doesn't support Notifications API");
	}
}

function showNotification(text) {
	if (notificationsEnabled) {
		var notification = new Notification("DRIVE", {
			body : text,
			requireInteraction: true,
      tag: 'require-interaction'
		});
	} else {
		alert("Notifications are disabled");
	}
}

//User setting --> sliders values
function onValueChange(){
	document.getElementById("breakOverview").innerHTML =  "Breaks of " + breakTime + " minutes selected with a " + intervalTime + " minute interval.";
}

//Tramontana connect and sensor logic
function connectDevice() {
  device.start($('#ipInput').val(), function(e) {
    $('button');
    sendFeedback();
		setTimeout(subscribeToDistance, 1000);;
		showNotification("Your phone is connected to the computer!");
  });
}

function sendFeedback() {
  //Needs a notification on the computer
  device.makeVibrate();
  device.setColor(144, 238, 144, 255);
}

function subscribeToMagnet(){
	device.subscribeMagnetometer(function(ip,e,b){
			$('#magnetometerContent').html(b);
			fieldStrength = b;
		});
}

function releaseFromMagnet(){
	device.releaseMagnetometer();
}

function subscribeToDistance(){
	device.subscribeDistance(function(ip,e){
		console.log(e);
		determineDeviceType(e);
		if (deviceType == "android") {
			if(e==5)
			{
				//$('#distanceContent').css('background-color','#fff');

				screenSaverEnd();
			}
			else
			{
				if (userStatus == "preparing") {
					startBreakTimer();
				}
				userStatus = "working";
				screenSaver();
			}
		}
		if (deviceType == "ios") {
			if(e==0)
			{
				//$('#distanceContent').css('background-color','#fff');

				screenSaverEnd();
			}
			else
			{

				if (userStatus == "preparing") {
					startBreakTimer();
				}

				userStatus = "working";
				screenSaver();
			}
		}
		else{
			console.log("device type not determined yet...");
		}
	});
}

function screenSaver(){
	showNotification("Good luck see you in ... minutes");
	$('#main-content').hide();
	background(51);
}

function screenSaverEnd(){
	showNotification("You have ... minutes remaining untill your next break. Click here to start your break now.");
}

function determineDeviceType(distanceValue){
	if (!isDeviceDetermined) {
		if (distanceValue == 5) {
			deviceType = "android";
			console.log("android");
		}
		else {
			deviceType = "ios";
			console.log("ios");
		}
		isDeviceDetermined = true;
	}
}

function releaseFromDistance(){
	device.releaseDistance();
}
