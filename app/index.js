import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";

// screen size
  const root = document.getElementById("background");
  const screenHeight = root.height;
  const screenWidth = root.width;
  const screenRadius = (screenHeight + screenWidth) / 2;

// hands
  const hourHand = document.getElementById("hours");
  const minuteHand = document.getElementById("minutes");
  const secondHand = document.getElementById("seconds");

// preferences
  const hourHandLength   = 35 / 100 * screenRadius;
  const minuteHandLength = 45 / 100 * screenRadius;
  const secondHandLength = 45 / 100 * screenRadius;

// everytick
  clock.granularity = "seconds";
  clock.ontick = function(event) {
    // get current time
      let now = event.date;
   
    // seconds
      let seconds = now.getSeconds();
      let secondAngle = getAngle(seconds, 60);
      let secondCoordinates = getEndpointCoordinates(secondAngle, secondHandLength);
      secondHand.x2 = secondCoordinates.x;
      secondHand.y2 = secondCoordinates.y;
    
    // minutes
      let minutes = now.getMinutes();
      minutes = minutes + (seconds / 60);
      let minuteAngle = getAngle(minutes, 60);
      let minuteCoordinates = getEndpointCoordinates(minuteAngle, minuteHandLength);
      minuteHand.x2 = minuteCoordinates.x;
      minuteHand.y2 = minuteCoordinates.y;

    // hours
      let hours = now.getHours();
      if (preferences.clockDisplay === "12h") {
        hours = hours % 12;                             // convert from 24-hour clock to 12-hour clock
      }
      hours = hours + (minutes / 60) + (seconds / 60 / 60);
      let hourAngle = getAngle(hours, 12);
      let hourCoordinates = getEndpointCoordinates(hourAngle, hourHandLength);
      hourHand.x2 = hourCoordinates.x;
      hourHand.y2 = hourCoordinates.y;
  }


// get angle of end of hand in radians
  function getAngle(currentTicks, ticksAroundTheCircle) {
    return (currentTicks / ticksAroundTheCircle)         // fraction around the circle
      * (Math.PI * 2)                                    // full circle in radians
      + (Math.PI / 2);                                   // 90 degree shift in radians (start at top instead of right side)
  }


// get position of end of hand in pixels
  function getEndpointCoordinates(angle, length) {
    let xFromCenter = Math.cos(angle) * length;          // polar to cartesian
    let yFromCenter = Math.sin(angle) * length;          // polar to cartesian
    return {
      x: (50 / 100 * screenRadius) +  xFromCenter,       // center from percent to pixel
      y: (50 / 100 * screenRadius) + (yFromCenter * -1)  // center from percent to pixel
    }
  }
