var currently = ['eating a baked potato', 'breaking code', 'sleeping', 'memorizing Drake lyrics'];

function displayCurrently() {
	return currently[Math.floor(Math.random() * currently.length)];
}

$('#doing').append(' ' + displayCurrently());