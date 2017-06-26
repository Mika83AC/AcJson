// Classes for ACJ format //////////////////////////////////////////////////////////////////////////////////////////
interface IAcJSONContainer {
	individuals: Array<IIndividualProtoOptional>, 
	families: Array<IFamilyProtoOptional>,
	children: Array<IChildProtoOptional>,
	events: Array<IEventProtoOptional>,
	media?: Array<IMediaProtoOptional>
};

interface IIndividualProto {
	id: string,
	preNames: string, 
	lastNames_Birth: string,
	lastNames_Mariage: string, 
	sexId: number,
	memo: string, 
	familySearchOrgId: string, 
}
interface IIndividualProtoOptional {
	id?: string,
	preNames?: string, 
	lastNames_Birth?: string,
	lastNames_Mariage?: string, 
	sexId?: number,
	memo?: string, 
	familySearchOrgId?: string, 
}
const IndividualProto: IIndividualProto = {
	id: '',
	preNames: '',
	lastNames_Birth: '',
	lastNames_Mariage: '',
	sexId: 1,
	memo: '',
	familySearchOrgId: ''
}
const IndividualFactory = function IndividualFactory(options?: IIndividualProtoOptional): IIndividualProto {
   return Object.assign(Object.create(IndividualProto), options);
}

interface IFamilyProto {
	id: string, 
	familySearchOrgId: string, 
	husbandId: string, 
	wifeId: string, 
	memo: string, 
}
interface IFamilyProtoOptional {
	id?: string, 
	familySearchOrgId?: string, 
	husbandId?: string, 
	wifeId?: string, 
	memo?: string, 
}
const FamilyProto: IFamilyProto = {
	id: '',
	familySearchOrgId: '',
	husbandId: '',
	wifeId: '',
	memo: ''
}
const FamilyFactory = function FamilyFactory(options?: IFamilyProtoOptional): IFamilyProto {
   return Object.assign(Object.create(IndividualProto), options);
}

interface IChildProto {
	id: string,
	individualId: string,
	familyId: string,
	memo: string,
}
interface IChildProtoOptional {
	id?: string,
	individualId?: string,
	familyId?: string,
	memo?: string,
}
const ChildProto: IChildProto = {
	id: '',
	individualId: '',
	familyId: '',
	memo: ''
}
const ChildFactory = function ChildFactory(options?: IChildProtoOptional): IChildProto {
   return Object.assign(Object.create(ChildProto), options);
}

interface IEventProto {
	id: string,
	eventTypeId: number,
	individualId: string,
	familyId: string,
	date: string,
	place: string,
	memo: string,
}
interface IEventProtoOptional {
	id?: string,
	eventTypeId?: number,
	individualId?: string,
	familyId?: string,
	date?: string,
	place?: string,
	memo?: string,
}
const EventProto: IEventProto = {
	id: '',
	eventTypeId: 0,
	individualId: '',
	familyId: '',
	date: '',
	place: '',
	memo: ''
}
const EventFactory = function EventFactory(options?: IEventProtoOptional): IEventProto {
   return Object.assign(Object.create(EventProto), options);
}

interface IMediaProto {
	id: string,
	mediaTypeId: number,
	individualId: string,
	familyId: string,
	path: string,
	place: string,
	memo: string,
}
interface IMediaProtoOptional {
	id?: string,
	mediaTypeId?: number,
	individualId?: string,
	familyId?: string,
	path?: string,
	place?: string,
	memo?: string,
}
const MediaProto: IMediaProto = {
	id: '',
	mediaTypeId: 0,
	individualId: '',
	familyId: '',
	path: '',
	place: '',
	memo: ''
}
const MediaFactory = function MediaFactory(options?: IMediaProtoOptional): IMediaProto {
   return Object.assign(Object.create(MediaProto), options);
}

// Converter functions ////////////////////////////////////////////////////////////////////////////////////////////
const GEDCOMtoACJSON = function(gedcomData: any): IAcJSONContainer {
	let lines: Array<string> = gedcomData.split('\n');
	let lastCommandSection: string = "", lastCommandLine: string = "";

	let nextEventId: number = 1, nextChildId: number = 1;

	let individuals: Array<IIndividualProto> = [];
	let families: Array<IFamilyProto> = [];
	let events: Array<IEventProto> = [];
	let children: Array<IChildProto> = [];
	let individual: IIndividualProto = IndividualFactory();
	let family: IFamilyProto = FamilyFactory();
	let event: IEventProto = EventFactory();
	let child: IChildProto = ChildFactory();
	let gedcomMarkerFound: boolean = false;

	lines.forEach(function forEachLine(line: string) {
		line = line.replace("\r", "");

		if(line.startsWith("1 GEDC")) gedcomMarkerFound = true;

		// Individual
		if(line.startsWith("0") && line.endsWith("INDI")) {
			individual = IndividualFactory();
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
			if(event.id.length > 0) {
				events.push(event);
			}

			event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 1, individualId: individual.id});
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 BIRT") && line.startsWith("2 PLAC")) {
			if(event.id.length === 0 || event.eventTypeId !== 1 || event.individualId !== individual.id) {
				if(event.id.length > 0) {
					events.push(event);
				}	

				event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 1, individualId: individual.id});
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = EventFactory();
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 CHR") && line.startsWith("2 DATE")) {
			if(event.id.length > 0) {
				events.push(event);
			}	

			event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 2, individualId: individual.id});
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 CHR") && line.startsWith("2 PLAC")) {
			if(event.id.length === 0 || event.eventTypeId !== 2 || event.individualId !== individual.id) {
				if(event.id.length > 0) {
					events.push(event);
				}	

				event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 2, individualId: individual.id});
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = EventFactory();
		}
		if(lastCommandSection === "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 DATE")) {
			if(event.id.length > 0) {
				events.push(event);
			}	

			event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 5, individualId: individual.id});
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "INDI" && lastCommandLine.startsWith("1 DEAT") && line.startsWith("2 PLAC")) {
			if(event.id.length === 0 || event.eventTypeId !== 5 || event.individualId !== individual.id) {
				if(event.id.length > 0) {
					events.push(event);
				}	

				event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 5, individualId: individual.id});
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
			event = EventFactory();
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
			if(family.id.length >  0) {
				families.push(family);
			}

			family = FamilyFactory();
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
			child = ChildFactory({id: 'C' + nextChildId++, familyId: family.id});
			child.individualId = line.substring(("1 CHIL").length + 1).replace("@", "").replace("@", "");

			children.push(child);
		}
		if(lastCommandSection === "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 DATE")) {
			if(event.id.length > 0) {
				events.push(event);
			}	

			event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 3, familyId: family.id});
			event.date = line.substring(("2 DATE").length + 1);
		}
		if(lastCommandSection == "FAM" && lastCommandLine.startsWith("1 MARR") && line.startsWith("2 PLAC")) {
			if(event.id.length === 0 || event.eventTypeId !== 3 || event.familyId !== family.id) {
				if(event.id.length > 0) {
					events.push(event);
				}	

				event = EventFactory({id: 'E' + nextEventId++, eventTypeId: 3, familyId: family.id});
			}

			event.place = line.substring(("2 PLAC").length + 1);
			events.push(event);
		}
		if(lastCommandSection === "FAM" && line.startsWith("1 _FSFTID")) {
			family.familySearchOrgId = line.substring(("1 _FSFTID").length + 1);
			families.push(family);
			family = FamilyFactory();
		}

		// CommandLine merken
		if (line.startsWith("1 ")) lastCommandLine = line;
	});

	if(!gedcomMarkerFound) {
		alert('In the choosen file, there are no GEDCOM header informations present.\rIt is very likely that the file can\'t be processed correctly!');
	}

	let obj: IAcJSONContainer = {individuals: individuals, families: families, children: children, events: events};

	nextEventId = 1;
	nextChildId = 1;

	return obj;
};
const ACJSONtoGEDCOM = function(acJSONObj: any): string {
	let lb: string = "\r\n";
	let data: IAcJSONContainer = JSON.parse(acJSONObj);
	let gedStr: string = "0 HEAD" + lb;
	gedStr += "1 CHAR UTF-8" + lb;
	gedStr += "1 GEDC" + lb;
	gedStr += "2 VERS 5.5" + lb;
	gedStr += "2 FORM LINEAGE-LINKED" + lb;

	// Individuals
	data.individuals.forEach(function forEachIndividual(individual) {
		gedStr += "0 @" + individual.id + "@ INDI" + lb;
		gedStr += "1 NAME " + individual.preNames + " /" + individual.lastNames_Birth + "/" + lb;
		gedStr += "1 SEX " + (individual.sexId === 1 ? "M" : "F") + lb;

		let birth: IEventProtoOptional | undefined = undefined;
		let baptism: IEventProtoOptional | undefined = undefined;
		let death: IEventProtoOptional | undefined = undefined;

		for(let event of data.events) {
			if(event.individualId === individual.id && event.eventTypeId === 1) birth = event;
			if(event.individualId === individual.id && event.eventTypeId === 2) baptism = event;
			if(event.individualId === individual.id && event.eventTypeId === 5) death = event;

			if(birth !== undefined && baptism !== undefined && death !== undefined) {
				break;
			}
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

		data.families.forEach(function forEachFamily(family) {
			if(family.husbandId === individual.id || family.wifeId === individual.id) {
				gedStr += "1 FAMS @" + family.id + "@" + lb;
			}
		});

		data.children.forEach(function forEachChild(child) {
			if(child.individualId === individual.id) {
				gedStr += "1 FAMC @" + child.familyId + "@" + lb;
			}
		});

		if(individual.familySearchOrgId !== undefined && individual.familySearchOrgId.length > 0) {
			gedStr += "1 _FSFTID " + individual.familySearchOrgId + lb;
		}
	});

	// Familien
	data.families.forEach(function forEachFamily(family) {
		gedStr += "0 @" + family.id + "@ FAM" + lb;

		if(family.husbandId !== undefined && family.husbandId.length > 0) {
			gedStr += "1 HUSB @" + family.husbandId + "@" + lb;
		}

		if(family.wifeId !== undefined && family.wifeId.length > 0) {
			gedStr += "1 WIFE @" + family.wifeId + "@" + lb;
		}

		data.children.forEach(function forEachChild(child) {
			if(child.familyId === family.id) {
				gedStr += "1 CHIL @" + child.individualId + "@" + lb;
			}
		});

		let marriage: IEventProtoOptional | undefined = undefined;
		let divore: IEventProtoOptional | undefined = undefined;

		for(let event of data.events) {
			if(event.familyId === family.id && event.eventTypeId === 3) marriage = event;
			if(event.familyId === family.id && event.eventTypeId === 4) divore = event;

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

		if(family.familySearchOrgId !== undefined && family.familySearchOrgId.length > 0) {
			gedStr += "1 _FSFTID " + family.familySearchOrgId + lb;
		}
	});

	gedStr += "0 TRLR" + lb;
	return gedStr;
};

// ACJ helper functions ///////////////////////////////////////////////////////////////////////////////////////////
const getIndividual = function(acJSONObj: IAcJSONContainer, individId: string) {
	for(let individual of acJSONObj.individuals) {
		if(individId !== '' && individual.id === individId)
			return individual;
	}

	return undefined;
};
const getFamilyId = function(acJSONObj: IAcJSONContainer, indidivId: string, childId: string) {
	for(let child of acJSONObj.children) {
		if((indidivId !== '' && child.individualId === indidivId) || (childId !== '' && child.id === childId))
			return child.familyId;
	}

	return undefined;
};
const getFamily = function(acJSONObj: IAcJSONContainer, familyId: string) {
	for(let family of acJSONObj.families) {
		if(familyId !== '' && family.id === familyId)
			return family;
	}

	return undefined;
};

// Sunburst Visualisation functions and variables ////////////////////////////////////////////////////////////////
const SunburstProto = {
	createVisualization: function createVisualization() {
		// For efficiency, filter nodes to keep only those large enough to see.
		let nodes = this.partition.nodes(this.hierarchyArray)
			.filter(d => d.dx > 0.005); // 0.005 radians = 0.29 degrees

		let boundCli = this.click.bind(this);
		let boundMouseo = this.mouseover.bind(this);
		let boundMousel = this.mouseleave.bind(this);

		let path = this.vis.data([this.hierarchyArray]).selectAll("path")
			.data(nodes)
			.enter().append("svg:path")
			.attr("display", d => d.depth ? null : "none")
			.attr("d", this.arc)
			.attr("fill-rule", "evenodd")
			.style("fill", d => d.color)
			.style("opacity", 1)
			.on("mouseover", boundMouseo)
			.on("click", boundCli);

		// Add the mouseleave handler to the bounding circle.
		d3.select("#container").on("mouseleave", boundMousel);

		let exp = document.getElementById("explanation");
		exp.style.width = '200px';
		exp.style.height = '200px';
		exp.style.left = (this.width / 2 - 100) + 'px';
		exp.style.top = (this.height / 2 - 100) + 'px';

		// Get total size of the tree = value of root node from partition.
		this.totalSize = path.node().__data__.value;
	},
	setInitialData: function setInitialData() {
		// Initial view of root data
	  	this.setTextForCenterInfo(this.hierarchyArray, undefined, undefined, true);
	},
	click: function click(d) {
		this.startIndividualId = d.data.id;
		refreshVis();
	},
	mouseover: function mouseover(d) {
		this.setTextForCenterInfo(d, undefined, undefined, false);

	  	let sequenceArray = this.getAncestors(d);
	  	this.updateBreadcrumbs(sequenceArray);

	  	// Fade all the segments.
	  	d3.selectAll("path").style("opacity", 0.3);

	  	// Then highlight only those that are an ancestor of the current segment.
	  	this.vis.selectAll("path")
		  	.filter(node => sequenceArray.indexOf(node) >= 0)
		  	.style("opacity", 1);
	},
	mouseleave: function mouseleave(d) {
	  	// Hide the breadcrumb trail
	  	d3.select("#trail").style("visibility", "hidden");

	  	// Deactivate all segments during transition.
	  	d3.selectAll("path").on("mouseover", null);

		let boundMof = this.mouseover.bind(this);

	  	// Transition each segment to full opacity and then reactivate it.
	  	d3.selectAll("path")
		  	.transition()
		  	.duration(250)
		  	.style("opacity", 1)
		  	.each("end", function() {
				d3.select(this).on("mouseover", boundMof);
			});

	  	// Revert view of root data
	  	this.setTextForCenterInfo(undefined, undefined, this.startIndividualId, true);
	},
	initializeBreadcrumbTrail: function initializeBreadcrumbTrail() {
	  	// Add the svg area.
	  	let trail = d3.select("#sequence").append("svg:svg")
		  	.attr("width", this.width)
		  	.attr("height", 50)
		  	.attr("id", "trail");

	  	trail.append("svg:text")
			.attr("id", "endlabel")
			.style("fill", "#000");
	},
	breadcrumbPoints: function breadcrumbPoints(d, i) {
	  	let points = [];
	  	points.push("0,0");
	  	points.push(this.b.w + ",0");
	  	points.push(this.b.w + this.b.t + "," + (this.b.h / 2));
	  	points.push(this.b.w + "," + this.b.h);
	  	points.push("0," + this.b.h);
	  	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
			points.push(this.b.t + "," + (this.b.h / 2));
	  	}
	  	return points.join(" ");
	},
	updateBreadcrumbs: function updateBreadcrumbs(nodeArray) {
		let that = this;
	  	let g = d3.select("#trail")
		  	.selectAll("g")
		  	.data(nodeArray, d => that.getTextForBreadcrumb(d, undefined, undefined));

	  	// Add breadcrumb and label for entering nodes.
	  	let entering = g.enter().append("svg:g");

		let boundBcp = this.breadcrumbPoints.bind(this);

	  	entering.append("svg:polygon")
		  	.attr("points", boundBcp)
		  	.style("fill", d => d.color);

		let boundGtfb = this.getTextForBreadcrumb.bind(this);

	  	entering.append("svg:text")
		  	.attr("x", (this.b.w + this.b.t) / 2)
		  	.attr("y", this.b.h / 2)
		  	.attr("dy", "0.35em")
		  	.attr("text-anchor", "middle")
		  	.text(d => boundGtfb(d, undefined, undefined));

	  	// Set position for entering and updating nodes.
	  	g.attr("transform", (d, i) => "translate(" + i * (that.b.w + that.b.s) + ", 0)");

	  	// Remove exiting nodes.
	  	g.exit().remove();

	  	// Make the breadcrumb trail visible, if it's hidden.
	  	d3.select("#trail").style("visibility", "");
	},

	buildHierarchyArray: function buildHierarchyArray(startIndividualId) {
		let indiv = ACJ.Helper.getIndividual(this.acJSONObj, startIndividualId);
		let indivNode = {"data": {}, "children": [], "size": 1000, "color": "#cccccc"};
		indivNode.data = indiv;

		this.getChildNodes(indiv, indivNode, indivNode.size / 2, true, "");

		this.hierarchyArray = indivNode;
	},
	getChildNodes: function getChildNodes(indiv, indivNode, size, first, parentColor) {
		let famId = ACJ.Helper.getFamilyId(this.acJSONObj, indiv.id);
		if(famId === undefined) {
			return undefined;
		}

		let fam = ACJ.Helper.getFamily(this.acJSONObj, famId);
		if(fam !== undefined) {
			let mother = ACJ.Helper.getIndividual(this.acJSONObj, fam.wifeId);
			let father = ACJ.Helper.getIndividual(this.acJSONObj, fam.husbandId);

			if(mother !== undefined) {
				let color = first ? "#490000" : (c => rgbToHex(hexToR(c), hexToG(c) + 30, hexToB(c)))(parentColor);
				let newNode = {"data": {}, "children": [], "size": size, "color": color}

				newNode.data = mother;
				this.getChildNodes(mother, newNode, size / 2, false, color);
				indivNode.children.push(newNode);
			}
			if(father !== undefined) {
				let color = first ? "#004900" : (c => rgbToHex(hexToR(c), hexToG(c), hexToB(c) + 30))(parentColor);
				let newNode = {"data": {}, "children": [], "size": size, "color": color}

				newNode.data = father;
				this.getChildNodes(father, newNode, size / 2, false, color);
				indivNode.children.push(newNode);
			}
		}

		return indivNode;
	},
	getAncestors: function getAncestors(node) {
	  	let path = [];
	  	let current = node;
	  	while (current.parent) {
			path.unshift(current);
			current = current.parent;
	  	}

	  	// And once again, because root should be always the first breadcrumb node
	  	path.unshift(current);

	  	return path;
	},
	setTextForCenterInfo: function setTextForCenterInfo(d3d, indiv, indivId, createChildLinks) {
		let individual = undefined;

		// Individual ermitteln
		if(d3d !== undefined) {
			individual = d3d.data;
		}
		else if(indiv !== undefined) {
			individual = indiv;
		}
		else if(indivId !== undefined) {
			for(let indi of this.acJSONObj.individuals) {
				if(indi.id === indivId) {
					individual = indi;
					break;
				}
			}
		}

		if(individual === undefined) {
			return 'Person konnte nicht ermittelt werden!'
		}

		document.getElementById("name").innerHTML = individual.preNames + ' ' + individual.lastNames_Birth;

		// Events dieser Person ermitteln
		let individualEvents = [];

		this.acJSONObj.events.forEach(event => {
			if(event.individualId === individual.id) {
				individualEvents.push(event);
			}
		});

		// Daten schreiben wenn vorhanden
		let birth = '', death = '';
		individualEvents.forEach(event => {
			if(event.eventTypeId === 1) birth = event.date;
			else if(event.eventTypeId === 5)	death = event.date;
		});

		document.getElementById("dates").innerHTML = (birth ? birth.substring(birth.length - 4) : '') + ' - ' + (death ? death.substring(death.length - 4) : '');

		// Links zu Kindern setzen
		this.removeChildLinks();
		if(createChildLinks) {
			this.findAndSetChildLinks(individual.id);
		}
	},
	getTextForBreadcrumb: function getTextForBreadcrumb(d3d, indiv, indivId) {
		let individual = undefined;

		if(d3d !== undefined) {
			individual = d3d.data;
		}
		else if(indiv !== undefined) {
			individual = indiv;
		}
		else if(indivId !== undefined) {
			for(let indi of this.acJSONObj.individuals) {
				if(indi.id === indivId) {
					individual = indi;
					break;
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
	},
	removeChildLinks: function removeChildLinks() {
		let cont = document.getElementById('explanation');
		let links = document.getElementsByClassName('uplink');

		while(links[0]) {
		   links[0].parentNode.removeChild(links[0]);
		}
	},
	findAndSetChildLinks: function findAndSetChildLinks(parentId) {
		let family = undefined;
		for(let fam of this.acJSONObj.families) {
			if(fam.husbandId === parentId || fam.wifeId === parentId) {
				family = fam;
				break;
			}
		}

		if(family === undefined) {
			return;
		}

		let children = [];
		this.acJSONObj.children.forEach(child => {
			if(child.familyId === family.id) {
				children.push(child);
			}
		});

		if(children.length > 0) {
			let cont = document.getElementById('explanation');

			let boundScar = this.setChildAsRoot.bind(this);

			for(let child of children) {
				let a = document.createElement('a');
				a.id = child.individualId;
				a.href = '#';
				a.innerHTML = 'Gehe zu ' + this.getTextForBreadcrumb(undefined, undefined, child.individualId);
				a.className = 'uplink';
				a.addEventListener('click', boundScar, false);

				cont.appendChild(a);
			}
		}
	},
	setChildAsRoot: function setChildAsRoot(e) {
		this.startIndividualId = e.currentTarget.id;
		refreshVis();
	},
};
const SunburstDefault = {
	acJSONObj: {},
	hierarchyArray: {},
	startIndividualId: 'I1',
	width: document.body.clientWidth,
	height: document.body.clientHeight - 60,
	radius: Math.min(document.body.clientWidth, document.body.clientHeight - 60) / 2.0,
	b: { w: 150, h: 30, s: 3, t: 10 },
	totalSize: 0,
	vis: undefined,
}
const SunburstFactory = function SunburstFactory(options: Object) {
	let newObj = Object.assign(Object.create(SunburstProto), SunburstDefault, options);

	newObj.partition = d3.layout.partition()
		.size([2 * Math.PI, newObj.radius * newObj.radius])
		.value(function(d) { return d.size; });

	newObj.arc = d3.svg.arc()
		.startAngle(function(d: any) { return d.x; })
		.endAngle(function(d: any) { return d.x + d.dx; })
		.innerRadius(function(d: any) { return Math.sqrt(d.y); })
		.outerRadius(function(d: any) { return Math.sqrt(d.y + d.dy); });

   return newObj;
}


// String helper functions ///////////////////////////////////////////////////////////////////////////
const pad = function pad(value: any, length: number): string {
	return (value.toString().length < length) ? pad("0"+value, length) : value;
} 
const countOfCharInStr = function countOfCharInStr(str: string, searchChar: string): number {
	let count = 0;
	for(let i = 0; i < str.length; i++) {
		if(str[i] === searchChar) count++;
	}
	return count;
};

// Color helper functions //////////////////////////////////////////////////////////////////////////
const hexToR = (h: any) => parseInt((cutHex(h)).substring(0,2),16);
const hexToG = (h: any) => parseInt((cutHex(h)).substring(2,4),16);
const hexToB = (h: any) => parseInt((cutHex(h)).substring(4,6),16);
const cutHex = (h: any) => (h.charAt(0) == "#") ? h.substring(1,7) : h;
const rgbToHex = (R: any,G: any,B: any) => toHex(R) + toHex(G) + toHex(B);

function toHex(n: any) {
 	n = parseInt(n,10);
 	if (isNaN(n)) return "00";
 	n = Math.max(0,Math.min(n,255));
 	return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
};
