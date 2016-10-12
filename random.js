var currently = ['eating a baked potato', 'breaking code', 'breaking hearts', 'napping', 'memorizing Drake lyrics'];

function displayCurrently() {
	return currently[Math.floor(Math.random() * currently.length)];
}

$('#doing').append(' ' + displayCurrently());