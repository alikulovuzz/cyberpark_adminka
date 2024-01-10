const moment = require('moment-timezone');


function getCurrentIndianDateTime(){
  // Get the current time in the 'Asia/Tashkent' time zone
  const timeInTashkent = moment().tz('Asia/Samarkand');

  // Add 4 hours to the current time
  const futureTimeInTashkent = timeInTashkent.add(5, 'hours');

  // Convert the result to a JavaScript Date object
  const dateInTashkent = futureTimeInTashkent.toDate();

  return dateInTashkent;
}
//request limitter
module.exports = getCurrentIndianDateTime;