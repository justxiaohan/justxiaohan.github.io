$.ajax({
	url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=soundssosoulful&api_key=cf817dddd0d91b419cbaabb62fc661de&format=json',
	type: 'get',
	cache: false,
	success: function(data) {
		$(data.recenttracks).each(function(index, value) {
			$('#nowplayingtrack').append(JSON.stringify(value.track[0].name).replace(/\"/g, ""));
			$('#nowplayingartist').append(JSON.stringify(value.track[0].artist['#text']).replace(/\"/g, ""));
			var listeningName = value.track[0].artist['#text'];
			var listeningUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + listeningName + '&api_key=cf817dddd0d91b419cbaabb62fc661de&format=json';

			$.ajax({
				url: listeningUrl,
				type: 'get',
				cache: false,
				success: function(data) {
					$(data.artist).each(function(index, value) {
						$('#mug').attr('src', value.image[4]['#text']);
					})
				}
			})

		}
	)}
});