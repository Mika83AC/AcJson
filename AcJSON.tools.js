"use strict";

// Namespaces /////////////////////////////////////////////////////////////////////////////////////////////////////////
var ACJ = ACJ || {};
ACJ.Conv = ACJ.Conv || {};
ACJ.Vis = ACJ.Vis || {};
ACJ.Vis.Sunburst = ACJ.Vis.Sunburst || {};
ACJ.Helper = ACJ.Helper || {};

// Classes for ACJ format //////////////////////////////////////////////////////////////////////////////////////////
ACJ.Individual = function(id, preNames, lastNames_Birth, lastNames_Mariage, sexId, memo, familySearchOrgId) {
	this.id = id;
	this.preNames = preNames;
	this.lastNames_Birth = lastNames_Birth;
	this.lastNames_Mariage = lastNames_Mariage;
	this.sexId = sexId;
	this.memo = memo;
	this.familySearchOrgId = familySearchOrgId;     
};
ACJ.Family = function(id, preNames, lastNames_Birth, lastNames_Mariage, sexId, memo, familySearchOrgId) {
	this.id = id;
	this.preNames = preNames;
	this.lastNames_Birth = lastNames_Birth;
	this.lastNames_Mariage = lastNames_Mariage;
	this.sexId = sexId;
	this.memo = memo;
	this.familySearchOrgId = familySearchOrgId;    
};
ACJ.Child = function(id, individualId, familyId, memo) {
	this.id = id;
	this.individualId = individualId;
	this.familyId = familyId;
	this.memo = "";         
};
ACJ.Event = function(id, eventTypeId, individualId, familyId, date, place, memo) {
	this.id = id;
	this.eventTypeId = eventTypeId;
	this.individualId = individualId;
	this.familyId = familyId;
	this.date = date;
	this.place = place;
	this.memo = memo;     
};
ACJ.Media = function(id, mediaTypeId, individualId, familyId, path, place, memo) {
	this.id = id;
	this.mediaTypeId = 0;
	this.individualId = individualId;
	this.familyId = familyId;
	this.path = path;
	this.memo = memo;   
};

// Converter functions ////////////////////////////////////////////////////////////////////////////////////////////
ACJ.Conv.GEDCOMtoACJ = function(gedcomData) {
	var lines = gedcomData.split('\n');
	var lastCommandSection = "";
	var lastCommandLine = "";

	var nextEventId = 1;
	var nextChildId = 1;

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
			individual = new ACJ.Individual();
			individual.id = line.substring(3).replace(" INDI", "").replace("@", "");

			if(individual.id === "I80") {
				var x = "";
			}

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
			if(event !== undefined) {
				events.push(event);
				event = undefined;
			}

			event = new ACJ.Event(nextEventId++, 1, individual.id, 0, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 PLAC")) {
			if(event === undefined || event.eventTypeId !== 1 || event.individualId !== individual.id) {
				if(event !== undefined) {
					events.push(event);
					event = undefined;
				}

				event = new ACJ.Event(nextEventId++, 1, individual.id, 0, "", "", "");
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = undefined;
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 CHR") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				events.push(event);
				event = undefined;
			}

			event = new ACJ.Event(nextEventId++, 2, individual.id, 0, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 CHR") && line.startsWith("2 PLAC")) {
			if(event === undefined || event.eventTypeId !== 2 || event.individualId !== individual.id) {
				if(event !== undefined) {
					events.push(event);
					event = undefined;
				}

				event = new ACJ.Event(nextEventId++, 2, individual.id, 0, "", "", "");
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = undefined;
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				events.push(event);
				event = undefined;
			}

			event = new ACJ.Event(nextEventId++, 5, individual.id, 0, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 PLAC")) {
			if(event === undefined || event.eventTypeId !== 5 || event.individualId !== individual.id) {
				if(event !== undefined) {
					events.push(event);
					event = undefined;
				}

				event = new ACJ.Event(nextEventId++, 5, individual.id, 0, "", "", "");
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
			if(family !== undefined) {
				families.push(family);
			}

			family = new ACJ.Family();
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
			child = new ACJ.Child();
			child.id = nextChildId++;
			child.individualId = line.substring(("1 CHIL").length + 1).replace("@", "").replace("@", "");
			child.familyId = family.id;

			children.push(child);
		}
		if(lastCommandSection === "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 DATE")) {
			if(event !== undefined) {
				events.push(event);
				event = undefined;
			}

			event = new ACJ.Event(nextEventId++, 3, 0, family.id, "", "", "");
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 PLAC")) {
			if(event === {} || event.eventTypeId !== 3 || event.familyId !== family.id) {
				if(event !== undefined) {
					events.push(event);
					event = undefined;
				}

				event = new ACJ.Event(nextEventId++, 3, 0, family.id, "", "", "");
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 _FSFTID")) {
			family.familySearchOrgId = line.substring(("1 _FSFTID").length + 1);
			families.push(family);
			family = undefined;
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
ACJ.Conv.ACJtoGEDCOM = function(ACJData) {
	var lb = "\r\n";
	var data = JSON.parse(ACJData);
	var gedStr = "0 HEAD" + lb;
	gedStr += "1 CHAR UTF-8" + lb;
	gedStr += "1 GEDC" + lb;
	gedStr += "2 VERS 5.5" + lb;
	gedStr += "2 FORM LINEAGE-LINKED" + lb;

	// Individuals
	for(var i = 0; i < data.individuals.length; i++) {
		gedStr += "0 @" + data.individuals[i].id + "@ INDI" + lb;
		gedStr += "1 NAME " + data.individuals[i].preNames + " /" + data.individuals[i].lastNames_Birth + "/" + lb;
		gedStr += "1 SEX " + (data.individuals[i].sexId === 1 ? "M" : "F") + lb;

		var birth = undefined, baptism = undefined, death = undefined;
		for(var j = 0; j < data.events.length; j++) {
			if(data.events[j].individualId === data.individuals[i].id && data.events[j].eventTypeId === 1) {
				birth = data.events[j];
			}
			if(data.events[j].individualId === data.individuals[i].id && data.events[j].eventTypeId === 2) {
				baptism = data.events[j];
			}
			if(data.events[j].individualId === data.individuals[i].id && data.events[j].eventTypeId === 5) {
				death = data.events[j];
			}

			if(birth !== undefined && baptism !== undefined && death !== undefined) {
				break;
			}
		}

		if(data.individuals[i].id === "I11") {
			var x = "";
		}

		if(birth !== undefined) {
			gedStr += "1 BIRT" + lb;

			if(birth.date !== undefined && birth.date.length > 0) {
				gedStr += "2 DATE " + birth.date + lb;
			}
			if(birth.place !== undefined && birth.place.length > 0) {
				gedStr += "2 PLAC " + birth.place + lb;
			}
		}
		if(baptism !== undefined) {
			gedStr += "1 CHR" + lb;

			if(baptism.date !== undefined && baptism.date.length > 0) {
				gedStr += "2 DATE " + baptism.date + lb;
			}
			if(baptism.place !== undefined && baptism.place.length > 0) {
				gedStr += "2 PLAC " + baptism.place + lb;
			}
		}
		if(death !== undefined) {
			gedStr += "1 DEAT" + lb;

			if(death.date !== undefined && death.date.length > 0) {
				gedStr += "2 DATE " + death.date + lb;
			}
			if(death.place !== undefined && death.place.length > 0) {
				gedStr += "2 PLAC " + death.place + lb;
			}
		}

		for(var k = 0; k < data.families.length; k ++) {
			if(data.families[k].husbandId === data.individuals[i].id || data.families[k].wifeId === data.individuals[i].id) {
				gedStr += "1 FAMS @" + data.families[k].id + "@" + lb;
			}
		}

		for(var l = 0; l < data.children.length; l ++) {
			if(data.children[l].individualId === data.individuals[i].id) {
				gedStr += "1 FAMC @" + data.children[l].familyId + "@" + lb;
				break;
			}
		}

		if(data.individuals[i].familySearchOrgId !== undefined) {
			gedStr += "1 _FSFTID " + data.individuals[i].familySearchOrgId + lb;
		}
	}

	// Familien
	for(var i = 0; i < data.families.length; i++) {
		gedStr += "0 @" + data.families[i].id + "@ FAM" + lb;

		if(data.families[i].husbandId !== undefined) {
			gedStr += "1 HUSB @" + data.families[i].husbandId + "@" + lb;
		}

		if(data.families[i].wifeId !== undefined) {
			gedStr += "1 WIFE @" + data.families[i].wifeId + "@" + lb;
		}

		for(var j = 0; j < data.children.length; j++) {
			if(data.children[j].familyId === data.families[i].id) {
				gedStr += "1 CHIL @" + data.children[j].individualId + "@" + lb;
			}
		}

		var marriage = undefined, divore = undefined;
		for(var j = 0; j < data.events.length; j++) {
			if(data.events[j].familyId === data.families[i].id && data.events[j].eventTypeId === 3) {
				marriage = data.events[j];
			}
			if(data.events[j].familyId === data.families[i].id && data.events[j].eventTypeId === 4) {
				divore = data.events[j];
			}

			if(marriage !== undefined && divore !== undefined) {
				break;
			}
		}

		if(marriage !== undefined) {
			gedStr += "1 MARR" + lb;

			if(marriage.date !== undefined && marriage.date.length > 0) {
				gedStr += "2 DATE " + marriage.date + lb;
			}
			if(marriage.place !== undefined && marriage.place.length > 0) {
				gedStr += "2 PLAC " + marriage.place + lb;
			}
		}
		
		// Divorces are not part of the GEDCOM format

		if(data.families[i].familySearchOrgId !== undefined) {
			gedStr += "1 _FSFTID " + data.families[i].familySearchOrgId + lb;
		}
	}

	gedStr += "0 TRLR" + lb;
	return gedStr;
};

// ACJ helper functions ///////////////////////////////////////////////////////////////////////////////////////////
ACJ.Helper.getIndividual = function(ACJ, individId) {
	for(var i = 0; i < ACJ.individuals.length; i++) {
		if(individId !== '' && ACJ.individuals[i].id === individId){
			return ACJ.individuals[i];
		}
	}

	return undefined;
};
ACJ.Helper.getFamilyId = function(ACJ, indidivId, childId) {
	for(var i = 0; i < ACJ.children.length; i++) {
		if((indidivId !== '' && ACJ.children[i].individualId === indidivId) ||
			(childId !== '' && ACJ.children[i].id === childId)){
			return ACJ.children[i].familyId;
		}
	}

	return undefined;
};
ACJ.Helper.getFamily = function(ACJ, familyId) {
	for(var i = 0; i < ACJ.families.length; i++) {
		if(familyId !== '' && ACJ.families[i].id === familyId){
			return ACJ.families[i];
		}
	}

	return undefined;
};

// Sunburst Visualisation functions and variables ////////////////////////////////////////////////////////////////
ACJ.Vis.Sunburst.ACJObj = {};
ACJ.Vis.Sunburst.hierarchyArray = {};
ACJ.Vis.Sunburst.startIndividualId = 'I1';

ACJ.Vis.Sunburst.width = document.body.clientWidth;
ACJ.Vis.Sunburst.height = document.body.clientHeight - 60;
ACJ.Vis.Sunburst.radius = Math.min(ACJ.Vis.Sunburst.width, ACJ.Vis.Sunburst.height) / 2.0;

ACJ.Vis.Sunburst.b = { w: 150, h: 30, s: 3, t: 10 };

ACJ.Vis.Sunburst.totalSize = 0; 

ACJ.Vis.Sunburst.vis = undefined;
ACJ.Vis.Sunburst.partition = d3.layout.partition()
	.size([2 * Math.PI, ACJ.Vis.Sunburst.radius * ACJ.Vis.Sunburst.radius])
	.value(function(d) { return d.size; });
ACJ.Vis.Sunburst.arc = d3.svg.arc()
	.startAngle(function(d) { return d.x; })
	.endAngle(function(d) { return d.x + d.dx; })
	.innerRadius(function(d) { return Math.sqrt(d.y); })
	.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

ACJ.Vis.Sunburst.createVisualization = function() {
  	// For efficiency, filter nodes to keep only those large enough to see.
  	var nodes = ACJ.Vis.Sunburst.partition.nodes(ACJ.Vis.Sunburst.hierarchyArray)
	  	.filter(function(d) {
	  		return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
	  	});

  	var path = ACJ.Vis.Sunburst.vis.data([ACJ.Vis.Sunburst.hierarchyArray]).selectAll("path")
	  	.data(nodes)
	  	.enter().append("svg:path")
	  	.attr("display", function(d) { return d.depth ? null : "none"; })
	  	.attr("d", ACJ.Vis.Sunburst.arc)
	  	.attr("fill-rule", "evenodd")
	  	.style("fill", function(d) { return d.color; })
	  	.style("opacity", 1)
	  	.on("mouseover", ACJ.Vis.Sunburst.mouseover)
	  	.on("click", ACJ.Vis.Sunburst.click);

  	// Add the mouseleave handler to the bounding circle.
  	d3.select("#container").on("mouseleave", ACJ.Vis.Sunburst.mouseleave);

  	var exp = document.getElementById("explanation");
  	exp.style.width = '200px';
  	exp.style.height = '200px';
	exp.style.left = (ACJ.Vis.Sunburst.width / 2 - 100) + 'px';
	exp.style.top = (ACJ.Vis.Sunburst.height / 2 - 100) + 'px';

	// Get total size of the tree = value of root node from partition.
  	ACJ.Vis.Sunburst.totalSize = path.node().__data__.value;
};
ACJ.Vis.Sunburst.setInitialData = function() {
	// Initial view of root data
  	ACJ.Vis.Sunburst.setTextForCenterInfo(ACJ.Vis.Sunburst.hierarchyArray, undefined, undefined, true);
};

ACJ.Vis.Sunburst.click = function(d) {
	ACJ.Vis.Sunburst.startIndividualId = d.data.id;
	refreshVis();
}
ACJ.Vis.Sunburst.mouseover = function(d) {
	ACJ.Vis.Sunburst.setTextForCenterInfo(d, undefined, undefined, false);

  	var sequenceArray = ACJ.Vis.Sunburst.getAncestors(d);
  	ACJ.Vis.Sunburst.updateBreadcrumbs(sequenceArray);

  	// Fade all the segments.
  	d3.selectAll("path").style("opacity", 0.3);

  	// Then highlight only those that are an ancestor of the current segment.
  	ACJ.Vis.Sunburst.vis.selectAll("path")
	  	.filter(function(node) {
			return (sequenceArray.indexOf(node) >= 0);
		})
	  	.style("opacity", 1);
};
ACJ.Vis.Sunburst.mouseleave = function(d) {
  	// Hide the breadcrumb trail
  	d3.select("#trail").style("visibility", "hidden");

  	// Deactivate all segments during transition.
  	d3.selectAll("path").on("mouseover", null);

  	// Transition each segment to full opacity and then reactivate it.
  	d3.selectAll("path")
	  	.transition()
	  	.duration(250)
	  	.style("opacity", 1)
	  	.each("end", function() {
			d3.select(this).on("mouseover", ACJ.Vis.Sunburst.mouseover);
		});

  	// Revert view of root data
  	ACJ.Vis.Sunburst.setTextForCenterInfo(undefined, undefined, ACJ.Vis.Sunburst.startIndividualId, true);
};

ACJ.Vis.Sunburst.getAncestors = function(node) {
  	var path = [];
  	var current = node;
  	while (current.parent) {
		path.unshift(current);
		current = current.parent;
  	}

  	// And once again, because root should be always the first breadcrumb node
  	path.unshift(current);

  	return path;
};

ACJ.Vis.Sunburst.initializeBreadcrumbTrail = function() {
  	// Add the svg area.
  	var trail = d3.select("#sequence").append("svg:svg")
	  	.attr("width", ACJ.Vis.Sunburst.width)
	  	.attr("height", 50)
	  	.attr("id", "trail");

  	trail.append("svg:text")
		.attr("id", "endlabel")
		.style("fill", "#000");
};
ACJ.Vis.Sunburst.breadcrumbPoints = function(d, i) {
  	var points = [];
  	points.push("0,0");
  	points.push(ACJ.Vis.Sunburst.b.w + ",0");
  	points.push(ACJ.Vis.Sunburst.b.w + ACJ.Vis.Sunburst.b.t + "," + (ACJ.Vis.Sunburst.b.h / 2));
  	points.push(ACJ.Vis.Sunburst.b.w + "," + ACJ.Vis.Sunburst.b.h);
  	points.push("0," + ACJ.Vis.Sunburst.b.h);
  	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
		points.push(ACJ.Vis.Sunburst.b.t + "," + (ACJ.Vis.Sunburst.b.h / 2));
  	}
  	return points.join(" ");
};
ACJ.Vis.Sunburst.updateBreadcrumbs = function(nodeArray) {
  	var g = d3.select("#trail")
	  	.selectAll("g")
	  	.data(nodeArray, function(d) { 
	  		return ACJ.Vis.Sunburst.getTextForBreadcrumb(d, undefined, undefined); 
	  	});

  	// Add breadcrumb and label for entering nodes.
  	var entering = g.enter().append("svg:g");

  	entering.append("svg:polygon")
	  	.attr("points", ACJ.Vis.Sunburst.breadcrumbPoints)
	  	.style("fill", function(d) { 
	  		return d.color; 
	  	});

  	entering.append("svg:text")
	  	.attr("x", (ACJ.Vis.Sunburst.b.w + ACJ.Vis.Sunburst.b.t) / 2)
	  	.attr("y", ACJ.Vis.Sunburst.b.h / 2)
	  	.attr("dy", "0.35em")
	  	.attr("text-anchor", "middle")
	  	.text(function(d) { 
	  		return ACJ.Vis.Sunburst.getTextForBreadcrumb(d, undefined, undefined); 
	  	});

  	// Set position for entering and updating nodes.
  	g.attr("transform", function(d, i) {
		return "translate(" + i * (ACJ.Vis.Sunburst.b.w + ACJ.Vis.Sunburst.b.s) + ", 0)";
  	});

  	// Remove exiting nodes.
  	g.exit().remove();

  	// Make the breadcrumb trail visible, if it's hidden.
  	d3.select("#trail").style("visibility", "");
};

// Sunburst Visualisation helper functions ////////////////////////////////////////////////////////////////////
ACJ.Vis.Sunburst.buildHierarchyArray = function(startIndividualId) {
	var indiv = ACJ.Helper.getIndividual(ACJ.Vis.Sunburst.ACJObj, startIndividualId);
	var indivNode = {"data": {}, "children": [], "size": 1000, "color": "#cccccc"};
	indivNode.data = indiv;

	ACJ.Vis.Sunburst.getChildNodes(indiv, indivNode, indivNode.size / 2, true, "");

	ACJ.Vis.Sunburst.hierarchyArray = indivNode;
};
ACJ.Vis.Sunburst.getChildNodes = function(indiv, indivNode, size, first, parentColor) {
	var famId = ACJ.Helper.getFamilyId(ACJ.Vis.Sunburst.ACJObj, indiv.id);
	if(famId === undefined) {
		return undefined;
	}

	var fam = ACJ.Helper.getFamily(ACJ.Vis.Sunburst.ACJObj, famId);
	if(fam !== undefined) {
		var mother = ACJ.Helper.getIndividual(ACJ.Vis.Sunburst.ACJObj, fam.wifeId);
		var father = ACJ.Helper.getIndividual(ACJ.Vis.Sunburst.ACJObj, fam.husbandId);

		if(mother !== undefined) {
			var color = first ? "#490000" : (function(c) { 
				var R = hexToR(c), G = hexToG(c), B = hexToB(c);
				return rgbToHex(R, G + 30, B);
			})(parentColor);
			var newNode = {"data": {}, "children": [], "size": size, "color": color}
			newNode.data = mother;
			ACJ.Vis.Sunburst.getChildNodes(mother, newNode, size / 2, false, color);
			indivNode.children.push(newNode);
		}
		if(father !== undefined) {
			var color = first ? "#004900" : (function(c) { 
				var R = hexToR(c), G = hexToG(c), B = hexToB(c);
				return rgbToHex(R, G, B + 30);
			})(parentColor);
			var newNode = {"data": {}, "children": [], "size": size, "color": color}
			newNode.data = father;
			ACJ.Vis.Sunburst.getChildNodes(father, newNode, size / 2, false, color);
			indivNode.children.push(newNode);
		}
	} 

	return indivNode;
}

ACJ.Vis.Sunburst.setTextForCenterInfo = function(d3d, indiv, indivId, createChildLinks) {
	var individual = undefined;

	// Individual ermitteln
	if(d3d !== undefined) {
		individual = d3d.data;
	} 
	else if(indiv !== undefined) {
		individual = indiv;
	}
	else if(indivId !== undefined) {
		for(var i = 0; i < ACJ.Vis.Sunburst.ACJObj.individuals.length; i++) {
			if(ACJ.Vis.Sunburst.ACJObj.individuals[i].id === indivId) {
				individual = ACJ.Vis.Sunburst.ACJObj.individuals[i];
			}
		}
	}

	if(individual === undefined) {
		return 'Person konnte nicht ermittelt werden!'
	}

	document.getElementById("name").innerHTML = individual.preNames + ' ' + individual.lastNames_Birth;

	// Events dieser Person ermitteln
	var individualEvents = [];
	for(var i = 0; i < ACJ.Vis.Sunburst.ACJObj.events.length; i++) {
		if(ACJ.Vis.Sunburst.ACJObj.events[i].individualId === individual.id) {
			individualEvents.push(ACJ.Vis.Sunburst.ACJObj.events[i]);
		}
	}

	// Daten schreiben wenn vorhanden
	var birth = '', death = '';
	for(var i = 0; i < individualEvents.length; i++) {
		if(individualEvents[i].eventTypeId === 1){
			birth = individualEvents[i].date;
		}
		else if(individualEvents[i].eventTypeId === 5){
			death = individualEvents[i].date;
		}
	}

	document.getElementById("dates").innerHTML = birth.substring(birth.length - 4) + ' - ' + death.substring(death.length - 4);

	// Links zu Kindern setzen
	ACJ.Vis.Sunburst.removeChildLinks();
	if(createChildLinks) {
		ACJ.Vis.Sunburst.findAndSetChildLinks(individual.id);
	}
};
ACJ.Vis.Sunburst.getTextForBreadcrumb = function(d3d, indiv, indivId) {
	var individual = undefined;

	if(d3d !== undefined) {
		individual = d3d.data;
	} 
	else if(indiv !== undefined) {
		individual = indiv;
	}
	else if(indivId !== undefined) {
		for(var i = 0; i < ACJ.Vis.Sunburst.ACJObj.individuals.length; i++) {
			if(ACJ.Vis.Sunburst.ACJObj.individuals[i].id === indivId) {
				individual = ACJ.Vis.Sunburst.ACJObj.individuals[i];
			}
		}
	}

	if(individual === undefined) {
		return 'XXX'
	}

	if(countOfCharInStr(individual.preNames, ' ') >= 1) {
		return individual.preNames.substring(0, individual.preNames.indexOf(' ') + 2) + '. ' + individual.lastNames_Birth;
	}

	return individual.preNames + ' ' + individual.lastNames_Birth;
};

ACJ.Vis.Sunburst.removeChildLinks = function() {
	var cont = document.getElementById('explanation');
	var links = document.getElementsByClassName('uplink');

	while(links[0]) {
	   links[0].parentNode.removeChild(links[0]);
	}
}
ACJ.Vis.Sunburst.findAndSetChildLinks = function(parentId) {
	var family = undefined;
	for(var i = 0; i < ACJ.Vis.Sunburst.ACJObj.families.length; i++) {
		if(ACJ.Vis.Sunburst.ACJObj.families[i].husbandId === parentId || ACJ.Vis.Sunburst.ACJObj.families[i].wifeId === parentId) {
			family = ACJ.Vis.Sunburst.ACJObj.families[i];
		}
	}

	if(family === undefined) {
		return;
	}

	var children = [];
	for(var i = 0; i < ACJ.Vis.Sunburst.ACJObj.children.length; i++) {
		if(ACJ.Vis.Sunburst.ACJObj.children[i].familyId === family.id) {
			children.push(ACJ.Vis.Sunburst.ACJObj.children[i]);
		}
	}

	if(children.length > 0) {
		var cont = document.getElementById('explanation');

		for(var i = 0; i < children.length; i++) {
			var a = document.createElement('a');
			a.id = children[i].individualId;
			a.href = '#';
			a.innerHTML = 'Gehe zu ' + ACJ.Vis.Sunburst.getTextForBreadcrumb(undefined, undefined, children[i].individualId);
			a.className = 'uplink';
			a.addEventListener('click', ACJ.Vis.Sunburst.setChildAsRoot, false);

			cont.appendChild(a);
		}
	}
};
ACJ.Vis.Sunburst.setChildAsRoot = function(e) {
	ACJ.Vis.Sunburst.startIndividualId = e.currentTarget.id;
	refreshVis();
};

// String helper functions ///////////////////////////////////////////////////////////////////////////
function pad(value, length) {
	return (value.toString().length < length) ? pad("0"+value, length):value;
};
function countOfCharInStr(str, searchChar) {
	var count = 0;
	for(var i = 0; i < str.length; i++) {
		if(str[i] === searchChar) {
			count++;
		}
	}

	return count;
};

// Color helper functions //////////////////////////////////////////////////////////////////////////
function hexToR(h) {
	return parseInt((cutHex(h)).substring(0,2),16);
};
function hexToG(h) {
	return parseInt((cutHex(h)).substring(2,4),16);
};
function hexToB(h) {
	return parseInt((cutHex(h)).substring(4,6),16);
};
function cutHex(h) {
	return (h.charAt(0)=="#") ? h.substring(1,7) : h;
};
function rgbToHex(R,G,B) {
	return toHex(R)+toHex(G)+toHex(B);
};
function toHex(n) {
 	n = parseInt(n,10);
 	if (isNaN(n)) return "00";
 	n = Math.max(0,Math.min(n,255));
 	return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
};