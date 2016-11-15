"use strict";

var nextEventId = 1;
var nextChildId = 1;

var Individual = function() {
   this.id = 0;
	this.preNames = "";
	this.lastNames_Birth = "";
	this.lastNames_Mariage = "";
	this.sexId = 1;
	this.memo = "";
	this.familySearchOrgId = "";
}
var Family = function() {
   this.id = 0;
	this.husbandId = 0;
	this.wifeId = 0;
	this.memo = "";
	this.familySearchOrgId = "";
}
var Child = function() {
   this.id = 0;
	this.individualId = 0;
	this.familyId = 0;
	this.memo = "";
}
var Event = function() {
   this.id = 0;
	this.eventTypeId = 0;
	this.individualId = 0;
	this.familyId = 0;
	this.date = "";
	this.place = "";
	this.memo = "";
}

function gedcomToJSON(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			var jsonContent = processFile(e.target.result);
			makeFile(jsonContent);
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

	var individuals = [], families = [], events = [], children = [];
	var individual = undefined, family = undefined, event = undefined, child = undefined;
	var gedcomMarkerFound = false;

	for(var row = 0; row < lines.length; row++){
		var line = lines[row];
		line = line.replace("\r", "");

		if(line.startsWith("1 GEDC")) {
			gedcomMarkerFound = true;
		}

		// Individual
		if(line.startsWith("0") && line.endsWith("INDI")) {
			individual = new Individual();
			individual.id = line.substring(3).replace(" INDI", "").replace("@", "");

			lastCommandSection = "INDI";
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 NAME")) {
			individual.preNames = line.substring(("1 NAME").length + 1, line.indexOf("/") - 1);
			individual.lastNames_Birth = line.substring(line.indexOf("/") + 1).replace("/", "");
		}
		if(lastCommandSection === "INDI" && line.startsWith("1 SEX")) {
			individual.sexId = line.substring(("1 SEX").length + 1) === "M" ? 1 : 2; 
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 DATE")) {
			event = newEvent(1, individual.id, 0);
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 PLAC")) {
			if(event === {} || event.eventType !== 1 || event.individualId !== individual.id) {
				event = newEvent(1, individual.id, 0);
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 DATE")) {
			event = newEvent(5, individual.id, 0);
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 PLAC")) {
			if(event === {} || event.eventType !== 5 || event.individualId !== individual.id) {
				event = newEvent(5, individual.id, 0);
			}

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
		if(line.startsWith("0") && line.endsWith("FAM")) {
			family = new Family();
			family.id = line.substring(3).replace(" FAM", "").replace("@", "");

			lastCommandSection = "FAM";
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 HUSB")) {
			family.husbandId = line.substring(("1 HUSB").length + 1).replace("@", "").replace("@", "");
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 WIFE")) {
			family.wifeId = line.substring(("1 WIFE").length + 1).replace("@", "").replace("@", "");
		}
		if (lastCommandSection === "FAM" && line.startsWith("1 CHIL")) {
			child = new Child();
			child.id = nextChildId++;
			child.individualId = line.substring(("1 CHIL").length + 1).replace("@", "").replace("@", "");
			child.familyId = family.id;

			children.push(child);
		}
		if(lastCommandSection === "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 DATE")) {
			event = newEvent(3, 0, family.id);
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 PLAC")) {
			if(event === {} || event.eventType !== 3 || event.familyId !== family.id) {
				event = newEvent(3, 0, family.id);
			}

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

	if(!gedcomMarkerFound) {
		alert('In the choosen file, there are no GEDCOM header informations present.\rIt is very likely that the file can\'t be processed correctly!');
	}

	var obj = {};
	obj.individuals = individuals;
	obj.families = families;
	obj.children = children;
	obj.events = events;

	return JSON.stringify(obj);
};
function makeFile(text) {
	var a = document.getElementById("downloadlink");
  	var data = new Blob([text], {type: 'text/plain'});

  	a.href = URL.createObjectURL(data);
  	a.innerHTML = "Download AcJSON file here";
};
function resetControls() {
	var a = document.getElementById("downloadlink");
	var inp = document.getElementById('fileinput');

	inp.value = "";
  	a.innerHTML = "";
};

function newEvent(eventType, individualId, familyId) {
	var event = new Event();
	event.id = nextEventId++;
	event.eventTypeId = eventType;
	event.individualId = individualId;
	event.familyId = familyId;
	return event;
};

window.document.getElementById('fileinput').addEventListener('change', gedcomToJSON, false);
window.document.getElementById('downloadlink').addEventListener('click', resetControls, false);
