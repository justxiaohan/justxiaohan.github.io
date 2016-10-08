$(document).ready(function() {
   	$.getJSON("http://jsonip.com/?callback=?", function (data) {
   		$.ajax({
   			url: 'http://ip-api.com/json',
   			type: 'get',
   			cache: false,
   			success: function(data) {
   				var city = data.city;
   				var region = data.regionName;
   				$('#geolocation').append(" " + city + " " + region);

   				var latitude = data.lat;
   				var longitude = data.lon;
   				var finalUrl = 'https://api.forecast.io/forecast/173d458dfef2c2b4473e99f6c6944df5/' + latitude + ',' + longitude;

   				$.ajax({
					url: finalUrl,
					dataType: 'jsonp',
					type: 'get',
					cache: false,
					success: function(data) {
						console.log(data);
						$(data.currently).each(function(index, value) {
							b = JSON.parse(value.temperature);
							y = JSON.parse(value.precipProbability);
							a = JSON.stringify(value.icon).replace(/\"/g, "").toUpperCase();
							if (a == 'CLEAR-DAY' || 'CLEAR-NIGHT') {
								$('#feels').append('there will be clear skies for the next hour');
							}
								else if (a == 'RAIN') {
									$('#feels').append('there will be rain for the next hour');
								}
								else if (a == 'SNOW') {
									$('#feels').append('there will be snow for the next hour');
								}
								else if (a == 'SLEET') {
									$('#feels').append('there will be sleet on the ground for the next hour');
								}
								else if (a == 'WIND') {
									$('#feels').append('it will be windy for the next hour');
								}
								else if (a == 'CLOUDY' || a == 'PARTLY-CLOUDY-DAY' || a == 'PARTLY-CLOUDY-NIGHT') {
									$('#feels').append('it will be cloudy for the next hour');
								}
								else {
									$('#feels').append('it\'s going to be a mess outside for the next hour');
								}
						});

						$('#temp').append(Math.round(b) + '&deg;');
						$('#precipp').append('and there is ' + Math.round(y)*100 + '&#37;' + ' chance of preciptation');

						var skycons = new Skycons({"color": "#000000"});
						var blub = a;
						skycons.add('iconcontainer', blub);
						skycons.play();

						$(data.hourly).each(function(index,value) {
							oneHour = JSON.parse(value.data[0].temperature);
							oneHourIcon = JSON.stringify(value.data[0].icon).replace(/\"/g, "").toUpperCase();
							twoHour = JSON.parse(value.data[1].temperature);
							twoHourIcon = JSON.stringify(value.data[1].icon).replace(/\"/g, "").toUpperCase();
							threeHour = JSON.parse(value.data[2].temperature);
							threeHourIcon = JSON.stringify(value.data[2].icon).replace(/\"/g, "").toUpperCase();
							fourHour = JSON.parse(value.data[3].temperature);
							fourHourIcon = JSON.stringify(value.data[3].icon).replace(/\"/g, "").toUpperCase();
							fiveHour = JSON.parse(value.data[4].temperature);
							fiveHourIcon = JSON.stringify(value.data[4].icon).replace(/\"/g, "").toUpperCase();
							sixHour = JSON.parse(value.data[5].temperature);
							sixHourIcon = JSON.stringify(value.data[5].icon).replace(/\"/g, "").toUpperCase();
						});

						$('#tempOne').append(Math.round(oneHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = oneHourIcon;
						skycons.add('dayOneHourContainer', blub);
						skycons.play();

						$('#tempTwo').append(Math.round(twoHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = twoHourIcon;
						skycons.add('dayTwoHourContainer', blub);
						skycons.play();

						$('#tempThree').append(Math.round(threeHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = threeHourIcon;
						skycons.add('dayThreeHourContainer', blub);
						skycons.play();

						$('#tempFour').append(Math.round(fourHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = fourHourIcon;
						skycons.add('dayFourHourContainer', blub);
						skycons.play();

						$('#tempFive').append(Math.round(fiveHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = fiveHourIcon;
						skycons.add('dayFiveHourContainer', blub);
						skycons.play();

						$('#tempSix').append(Math.round(sixHour) + '&deg;');

						var skycons = new Skycons({"color": "#000000"});
						var blub = sixHourIcon;
						skycons.add('daySixHourContainer', blub);
						skycons.play();
					}
				});
				   			}
				   		});
				   	});
				});