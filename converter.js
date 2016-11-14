"use strict";

function readFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			processFile(e.target.result);
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};
function processFile(fileContent) {
	var lines = fileContent.split('\n');
	var lastCommandSection = "";
	var lastCommandLine = "";

	var familyMembers = [];
	var families = [];
	var events = [];

	var nextEventId = 1;

	var individual = undefined;
	var family = undefined;
	var event = undefined;

	for(var line = 0; line < lines.length; line++){
		
		if(line.startsWith("0") && line.endsWith("INDI")) {
			if(individual !== undefined) {
				familyMembers.push(individual);
			}

			individual = {};
			individual.id = line.substring(0, 3).replace(" INDI", "");

			lastCommandSection = "INDI";
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 NAME")) {
			individual.preNames = line.substring(("1 NAME").length + 1, line.indexOf("/") - ("1 NAME").length - 2);
			individual.lastName_birth = line.substring(line.indexOf("/") + 1).replace("/", "");
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 SEX")) {
			individual.sexId = line.substring((("1 SEX").length + 1).toLower() === "male" ? 1 : 2); 
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 BIRTH") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				event === undefined;
			}

			event.id = nextEventId++;
			event.eventType = 1; // Birth
			event.individualId = individual.id;
			event.familyId = 0;
			event.date = Date.parse(line.substring(("2 DATE").Length + 1);
		}
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
