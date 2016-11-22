"use strict";

var nextEventId = 1;
var nextChildId = 1;

// Classes for AcJSON format
class Individual {
	constructor(id, preNames, lastNames_Birth, lastNames_Mariage, sexId, memo, familySearchOrgId) {
 		this.id = id;
		this.preNames = preNames;
		this.lastNames_Birth = lastNames_Birth;
		this.lastNames_Mariage = lastNames_Mariage;
		this.sexId = sexId;
		this.memo = memo;
		this.familySearchOrgId = familySearchOrgId;
		}		
};
class Family {
	constructor(id, preNames, lastNames_Birth, lastNames_Mariage, sexId, memo, familySearchOrgId) {
 		this.id = id;
		this.preNames = preNames;
		this.lastNames_Birth = lastNames_Birth;
		this.lastNames_Mariage = lastNames_Mariage;
		this.sexId = sexId;
		this.memo = memo;
		this.familySearchOrgId = familySearchOrgId;
		}		
};
class Child {
	constructor(id, individualId, familyId, memo) {
 		this.id = id;
		this.individualId = individualId;
		this.familyId = familyId;
		this.memo = "";
		}			
};
class Event {
	constructor(id, eventTypeId, individualId, familyId, date, place, memo) {
 		this.id = id;
		this.eventTypeId = eventTypeId;
		this.individualId = individualId;
		this.familyId = familyId;
		this.date = date;
		this.place = place;
		this.memo = memo;
		}		
};
class Media {
	constructor(id, mediaTypeId, individualId, familyId, path, place, memo) {
 		this.id = id;
		this.mediaTypeId = 0;
		this.individualId = individualId;
		this.familyId = familyId;
		this.path = path;
		this.memo = memo;
		}		
};

// Functions
function gedcomToAcJSON(gedcomData) {
	var lines = gedcomData.split('\n');
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
			event = new Event(nextEventId++, 1, individual.id, 0, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 PLAC")) {
			if(event === undefined || event.eventTypeId !== 1 || event.individualId !== individual.id) {
				event = new Event(nextEventId++, 1, individual.id, 0, "", "", "");
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = undefined;
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 DATE")) {
			event = new Event(nextEventId++, 5, individual.id, 0, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 PLAC")) {
			if(event === undefined || event.eventTypeId !== 5 || event.individualId !== individual.id) {
				event = new Event(nextEventId++, 5, individual.id, 0, "", "", "");
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = undefined;
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
			event = new Event(nextEventId++, 3, 0, family.id, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 PLAC")) {
			if(event === {} || event.eventType !== 3 || event.familyId !== family.id) {
				event = new Event(nextEventId++, 3, 0, family.id, "", "", "");
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

	nextEventId = 1;
	nextChildId = 1;

	return JSON.stringify(obj);
};