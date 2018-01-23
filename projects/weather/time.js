function movingTime() {
	var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    h = notMilitary(h);
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('date').innerHTML = h + ":" + m + ":" + s;
	var t = setTimeout(movingTime, 500);

	var firstTime = h + 1
	firstTime = notMilitary(firstTime)
	document.getElementById('timeOne').innerHTML = firstTime + ':00';

	var secondTime = h + 2
	secondTime = notMilitary(secondTime)
	document.getElementById('timeTwo').innerHTML = secondTime + ':00';

	var thirdTime = h + 3
	thirdTime = notMilitary(thirdTime)
	document.getElementById('timeThree').innerHTML = thirdTime + ':00';

	var fourthTime = h + 4
	fourthTime = notMilitary(fourthTime)
	document.getElementById('timeFour').innerHTML = fourthTime + ':00';

	var fifthTime = h + 5
	fifthTime = notMilitary(fifthTime)
	document.getElementById('timeFive').innerHTML = fifthTime + ':00';

	var sixthTime = h + 6
	sixthTime = notMilitary(sixthTime)
	document.getElementById('timeSix').innerHTML = sixthTime + ':00';
}

function notMilitary(i) {
    if (i > 12) {i = i - 12};
    return i;
}
function checkTime(i) {
    if (i < 10) {i = '0' + i};
    return i;
}

movingTime();