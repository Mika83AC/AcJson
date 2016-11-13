"use strict";

function readFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			createJson(e.target.result);
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};
function createJson(fileContent) {
	var lines = fileContent.split('\n');
	for(var line = 0; line < lines.length; line++){
		console.log(lines[line]);
	}
};
function makeFile(text) {
	var data = new Blob([text], {type: 'text/plain'});

	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	return window.URL.createObjectURL(data);
};

window.document.getElementById('fileinput').addEventListener('change', readFile, false);