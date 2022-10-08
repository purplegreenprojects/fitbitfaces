import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import { charger, battery } from "power";
import userActivity from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";

// screen size
  var root = document.getElementById("container");
  var screenHeight = root.height;
  var screenWidth = root.width;
  var screenRadius = (screenHeight + screenWidth) / 2;

// preferences
  var hourHandLength   = 35 / 100 * screenRadius;
  var minuteHandLength = 45 / 100 * screenRadius;
  var secondHandLength = 45 / 100 * screenRadius;

// hands
  var hourHand = document.getElementById("hours");
  var minuteHand = document.getElementById("minutes");
  var secondHand = document.getElementById("seconds");

// stats
  var dayCorner = document.getElementById("day");
  var dateMonthCorner = document.getElementById("dateMonth");
  var dateDayCorner = document.getElementById("dateDay");
  var batteryCorner = document.getElementById("battery");
  var caloriesCorner = document.getElementById("calories");
  var hrCenter = document.getElementById("heartrate");
  var stepsCenter = document.getElementById("steps");

// everytick
  clock.granularity = "seconds";
  clock.ontick = function(event) {
    // get current time
      var now = event.date;
      setHands(now);
      displayDate(now);
    
    // display stats
      displayBattery();
      displayCalories();
      displaySteps();
  }

// set hands
  function setHands(now){
    // seconds
      var seconds = now.getSeconds();
      var secondAngle = getAngle(seconds, 60);
      var secondCoordinates = getEndpointCoordinates(secondAngle, secondHandLength);
      secondHand.x2 = secondCoordinates.x;
      secondHand.y2 = secondCoordinates.y;

    // minutes
      var minutes = now.getMinutes();
      minutes = minutes + (seconds / 60);
      var minuteAngle = getAngle(minutes, 60);
      var minuteCoordinates = getEndpointCoordinates(minuteAngle, minuteHandLength);
      minuteHand.x2 = minuteCoordinates.x;
      minuteHand.y2 = minuteCoordinates.y;

    // hours
      var hours = now.getHours();
      if (preferences.clockDisplay === "12h") {
        hours = hours % 12;                             // convert from 24-hour clock to 12-hour clock
      }
      hours = hours + (minutes / 60) + (seconds / 60 / 60);
      var hourAngle = getAngle(hours, 12);
      var hourCoordinates = getEndpointCoordinates(hourAngle, hourHandLength);
      hourHand.x2 = hourCoordinates.x;
      hourHand.y2 = hourCoordinates.y;
  }

// display Date
  function displayDate(now){
    // date of the week
      var dayNumber = now.getDay();

      var daysofweek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
      var day = daysofweek[dayNumber];

      dayCorner.text = day;

    // month of the year
      var monthNumber = now.getMonth();

      var monthsofyear = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
      var month = monthsofyear[monthNumber];

      dateMonthCorner.text = month;

    // date of the month
      var dateNumber = now.getDate();

      dateDayCorner.text = dateNumber;
  }

// get angle of end of hand in radians
  function getAngle(currentTicks, ticksAroundTheCircle) {
    return (currentTicks / ticksAroundTheCircle)         // fraction around the circle
      * (Math.PI * 2)                                    // full circle in radians
      + (Math.PI / 2);                                   // 90 degree shift in radians (start at top instead of right side)
  }


// get position of end of hand in pixels
  function getEndpointCoordinates(angle, length) {
    var xFromCenter = Math.cos(angle) * length;          // polar to cartesian
    var yFromCenter = Math.sin(angle) * length;          // polar to cartesian
    return {
      x: (50 / 100 * screenRadius) +  xFromCenter,       // center from percent to pixel
      y: (50 / 100 * screenRadius) + (yFromCenter * -1)  // center from percent to pixel
    }
  }

// display Battery
  function displayBattery(){
    if (charger.connected) {
      batteryCorner.style.opacity = 0;
    }
    else {
      batteryCorner.style.opacity = 1;
      batteryCorner.text = Math.floor(battery.chargeLevel) + "%";
    }
  }

// display Calories
  function displayCalories(){
    caloriesCorner.text = userActivity.today.adjusted.calories;
  }
  
// display steps
  function displaySteps(){
    stepsCenter.text = userActivity.today.adjusted.steps;
  }

// display heart rate
  if (HeartRateSensor) {
    var hrm = new HeartRateSensor({frequency: 1});

    hrm.addEventListener("reading", function() {
      hrCenter.text = hrm.heartRate;
    });
    hrm.start();

    display.addEventListener("change", function() {
      if (display.on) {
        hrm.start();
      }
      else {
        hrm.stop();
      }
    });
  }
