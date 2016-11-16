"use strict";

// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

var dataSource = {};

// Mapping of step names to colors.
var colors = {
	"I1": "#5687d1",
	"I2": "#7b615c",
	"I3": "#de783b"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
	.attr("width", width)
	.attr("height", height)
	.append("svg:g")
	.attr("id", "container")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
var partition = d3.layout.partition()
	.size([2 * Math.PI, radius * radius])
	.value(function(d) { return d.size; });
var arc = d3.svg.arc()
	.startAngle(function(d) { return d.x; })
	.endAngle(function(d) { return d.x + d.dx; })
	.innerRadius(function(d) { return Math.sqrt(d.y); })
	.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {
	// Basic setup of page elements.
	initializeBreadcrumbTrail();

	// Bounding circle underneath the sunburst, to make it easier to detect
	// when the mouse leaves the parent g.
	vis.append("svg:circle")
		.attr("r", radius)
		.style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
		.filter(function(d) {
		return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
		});

  var path = vis.data([json]).selectAll("path")
		.data(nodes)
		.enter().append("svg:path")
		.attr("display", function(d) { return d.depth ? null : "none"; })
		.attr("d", arc)
		.attr("fill-rule", "evenodd")
		.style("fill", function(d) { return colors[d.name]; })
		.style("opacity", 1)
		.on("mouseover", mouseover);

  	// Add the mouseleave handler to the bounding circle.
  	d3.select("#container").on("mouseleave", mouseleave);

  	// Get total size of the tree = value of root node from partition.
  	totalSize = path.node().__data__.value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  	d3.select("#percentage")
		.text(d.name);

  	d3.select("#explanation")
		.style("visibility", "");

  	var sequenceArray = getAncestors(d);
  	updateBreadcrumbs(sequenceArray, d.name);

  	// Fade all the segments.
  	d3.selectAll("path")
		.style("opacity", 0.3);

  	// Then highlight only those that are an ancestor of the current segment.
  	vis.selectAll("path")
		.filter(function(node) {
			return (sequenceArray.indexOf(node) >= 0);
		})
		.style("opacity", 1);
};

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  	// Hide the breadcrumb trail
  	d3.select("#trail")
		.style("visibility", "hidden");

  	// Deactivate all segments during transition.
  	d3.selectAll("path").on("mouseover", null);

  	// Transition each segment to full opacity and then reactivate it.
  	d3.selectAll("path")
		.transition()
		.duration(1000)
		.style("opacity", 1)
		.each("end", function() {
			d3.select(this).on("mouseover", mouseover);
		});

  	d3.select("#explanation")
		.style("visibility", "hidden");
};

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  	var path = [];
  	var current = node;
  	while (current.parent) {
	 	path.unshift(current);
	 	current = current.parent;
  	}
  	return path;
};

function initializeBreadcrumbTrail() {
  	// Add the svg area.
  	var trail = d3.select("#sequence").append("svg:svg")
		.attr("width", width)
		.attr("height", 50)
		.attr("id", "trail");
  	// Add the label at the end, for the percentage.
  	trail.append("svg:text")
	 	.attr("id", "endlabel")
	 	.style("fill", "#000");
};

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  	var points = [];
  	points.push("0,0");
  	points.push(b.w + ",0");
  	points.push(b.w + b.t + "," + (b.h / 2));
  	points.push(b.w + "," + b.h);
  	points.push("0," + b.h);
  	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
	 	points.push(b.t + "," + (b.h / 2));
  	}
  	return points.join(" ");
};

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  	// Data join; key function combines name and depth (= position in sequence).
  	var g = d3.select("#trail")
		.selectAll("g")
		.data(nodeArray, function(d) { return d.name + d.depth; });

  	// Add breadcrumb and label for entering nodes.
  	var entering = g.enter().append("svg:g");

  	entering.append("svg:polygon")
		.attr("points", breadcrumbPoints)
		.style("fill", function(d) { return colors[d.name]; });

  	entering.append("svg:text")
		.attr("x", (b.w + b.t) / 2)
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

  	// Set position for entering and updating nodes.
  	g.attr("transform", function(d, i) {
	 	return "translate(" + i * (b.w + b.s) + ", 0)";
  	});

  	// Remove exiting nodes.
  	g.exit().remove();

  	// Now move and update the percentage at the end.
  	d3.select("#trail").select("#endlabel")
		.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(percentageString);

  	// Make the breadcrumb trail visible, if it's hidden.
  	d3.select("#trail")
		.style("visibility", "");
};

function buildHierarchyArray() {
	var root = {"name": "root", "children": [], "size": 100};

	var indiv = getIndividual("I1");
	var indivNode = {"name": "", "children": [], "size": 100};
	indivNode.name = indiv.preNames + ' ' + indiv.lastNames_Birth;

	root.children.push(getChildNodes(indiv, indivNode, 2));

	return root;
};
function getChildNodes(indiv, indivNode, generation) {
	var famId = getFamilyId(indiv.id);
	if(famId === undefined) {
		return undefined;
	}

	var fam = getFamily(famId);
	if(fam !== undefined) {
		var mother = getIndividual(fam.wifeId);
		var father = getIndividual(fam.husbandId);

		if(mother !== undefined) {
			var newNode = {"name": "", "children": [], "size": 50}
			newNode.name = mother.preNames + ' ' + mother.lastNames_Birth;
			getChildNodes(mother, newNode, generation + 1);
			indivNode.children.push(newNode);
		}
		if(father !== undefined) {
			var newNode = {"name": "", "children": [], "size": 50}
			newNode.name = father.preNames + ' ' + father.lastNames_Birth;
			getChildNodes(father, newNode, generation + 1);
			indivNode.children.push(newNode);
		}
	} else {
	}

	return indivNode;
}

function getIndividual(individId) {
	for(var i = 0; i < dataSource.individuals.length; i++) {
		if(individId !== '' && dataSource.individuals[i].id === individId){
			return dataSource.individuals[i];
		}
	}

	return undefined;
};
function getFamilyId(indidivId, childId) {
	for(var i = 0; i < dataSource.children.length; i++) {
		if((indidivId !== '' && dataSource.children[i].individualId === indidivId) ||
			(childId !== '' && dataSource.children[i].id === childId)){
			return dataSource.children[i].familyId;
		}
	}

	return undefined;
};
function getFamily(familyId) {
	for(var i = 0; i < dataSource.families.length; i++) {
		if(familyId !== '' && dataSource.families[i].id === familyId){
			return dataSource.families[i];
		}
	}

	return undefined;
};

function startVis(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			dataSource = JSON.parse(e.target.result);

			var hierarchyArray = buildHierarchyArray();
			createVisualization(hierarchyArray);
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};

window.document.getElementById('fileinput').addEventListener('change', startVis, false);