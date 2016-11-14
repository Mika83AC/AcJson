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

	var individuals = [];
	var families = [];
	var events = [];
	var children = [];

	var nextEventId = 1;
	var nextChildId = 1;

	var individual = undefined;
	var family = undefined;
	var event = undefined;
	var child = undefined;

	for(var row = 0; row < lines.length; row++){
		var line = lines[row];

		// Individual
		if(line.startsWith("0") && line.endsWith("INDI\r")) {
			individual = {};
			individual.id = line.substring(3).replace(" INDI", "");

			lastCommandSection = "INDI";
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 NAME")) {
			individual.preNames = line.substring(("1 NAME").length + 1, line.indexOf("/") - 1);
			individual.lastName_birth = line.substring(line.indexOf("/") + 1).replace("/", "");
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 SEX")) {
			individual.sexId = line.substring(("1 SEX").length + 1) === "M" ? 1 : 2; 
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				event === undefined;
			}

			event = {};
			event.id = nextEventId++;
			event.eventType = 1; // Birth
			event.individualId = individual.id;
			event.familyId = 0;
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 PLAC")) {
			event.place = line.substring(("2 PLAC").length + 1);

			events.push(event);
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				event === undefined;
			}

			event = {};
			event.id = nextEventId++;
			event.eventType = 5; // Death
			event.individualId = individual.id;
			event.familyId = 0;
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 PLAC")) {
			event.place = line.substring(("2 PLAC").length + 1);

			events.push(event);
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 FAMS")) {
			// Familie des Individuals
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 FAMC")) {
			// ist Kind von Familie x
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 _FSFTID")) {
			individual.familySearchOrgId = line.substring(("1 _FSFTID").length + 1);

			individuals.push(individual);
		}

		// Families
		if(line.startsWith("0") && line.endsWith("FAM\r")) {
			if(family !== undefined) {
				families.push(family);
			}

			family = {};
			family.id = line.substring(3).replace(" FAM", "");

			lastCommandSection = "FAM";
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 HUSB")) {
			family.husbandId = line.substring(("1 HUSB").length + 1);
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 WIFE")) {
			family.wifeId = line.substring(("1 WIFE").length + 1);
		}
		if (lastCommandSection === "FAM" && line.startsWith("1 CHIL")) {
			if(child !== undefined) {
				child === undefined;
			}

			child = {};
			child.id = nextChildId++;
			child.individualId = line.substring(("1 CHIL").length + 1);
			child.familyId = family.id;

			children.push(child);
		}
		if(lastCommandSection === "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				event === undefined;
			}

			event = {};
			event.id = nextEventId++;
			event.eventType = 3; // Marriage
			event.individualId = 0;
			event.familyId = family.id;
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 PLAC")) {
			event.place = line.substring(("2 PLAC").length + 1);

			events.push(event);
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 _FSFTID")) {
			family.familySearchOrgId = line.substring(("1 _FSFTID").length + 1);

			families.push(family);
		}

		// CommandLine merken
		if (line.startsWith("1 ")) {
			lastCommandLine = line;
		}
	}

	var i = 0;
};
function makeFile(text) {
	var data = new Blob([text], {type: 'text/plain'});

	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	return window.URL.createObjectURL(data);
};

window.document.getElementById('fileinput').addEventListener('change', readFile, false);
