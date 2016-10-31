var currently = ['eating a loaded baked potato', 'breaking code', 'breaking hearts', 'napping', 'memorizing Drake lyrics'];

function displayCurrently() {
	return currently[Math.floor(Math.random() * currently.length)];
}

$('#doing').append(' ' + displayCurrently());