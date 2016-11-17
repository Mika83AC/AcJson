"use strict";

var dataSource = {};
var hierarchyArray = {};

// Dimensions of sunburst.
var width = document.body.clientWidth;
var height = document.body.clientHeight - 100;
var radius = Math.min(width, height) / 1.8;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = { w: 140, h: 30, s: 3, t: 10 };

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
	  	.style("fill", function(d) { return d.color; })
	  	.style("opacity", 1)
	  	.on("mouseover", mouseover);

  	// Add the mouseleave handler to the bounding circle.
  	d3.select("#container").on("mouseleave", mouseleave);

  	var exp = document.getElementById("explanation");
  	exp.style.width = '200px';
  	exp.style.height = '200px';
	exp.style.left = (width / 2 - 100) + 'px';
	exp.style.top = (height / 2 - 100) + 'px';

  	// Initial view of root data
  	d3.select("#percentage").text(json.data.preNames + ' ' + json.data.lastNames_Birth);

		// Get total size of the tree = value of root node from partition.
  		totalSize = path.node().__data__.value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
  	d3.select("#percentage").text(d.data.preNames + ' ' + d.data.lastNames_Birth);

  	//d3.select("#explanation").style("visibility", "");

  	var sequenceArray = getAncestors(d);
  	updateBreadcrumbs(sequenceArray);

  	// Fade all the segments.
  	d3.selectAll("path").style("opacity", 0.3);

  	// Then highlight only those that are an ancestor of the current segment.
  	vis.selectAll("path")
	  	.filter(function(node) {
			return (sequenceArray.indexOf(node) >= 0);
		})
	  	.style("opacity", 1);
}
// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  	// Hide the breadcrumb trail
  	d3.select("#trail").style("visibility", "hidden");

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

  	//d3.select("#explanation").style("visibility", "hidden");

  	// Revert view of root data
  	d3.select("#percentage").text(hierarchyArray.data.preNames + ' ' + hierarchyArray.data.lastNames_Birth);
}

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
}

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
}
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
}
// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray) {
  	var g = d3.select("#trail")
	  	.selectAll("g")
	  	.data(nodeArray, function(d) { return d.data.preNames + ' ' + d.data.lastNames_Birth; });

  	// Add breadcrumb and label for entering nodes.
  	var entering = g.enter().append("svg:g");

  	entering.append("svg:polygon")
	  	.attr("points", breadcrumbPoints)
	  	.style("fill", function(d) { return d.color; });

  	entering.append("svg:text")
	  	.attr("x", (b.w + b.t) / 2)
	  	.attr("y", b.h / 2)
	  	.attr("dy", "0.35em")
	  	.attr("text-anchor", "middle")
	  	.text(function(d) { return d.data.preNames + ' ' + d.data.lastNames_Birth; });

  	// Set position for entering and updating nodes.
  	g.attr("transform", function(d, i) {
		return "translate(" + i * (b.w + b.s) + ", 0)";
  	});

  	// Remove exiting nodes.
  	g.exit().remove();

  	// Make the breadcrumb trail visible, if it's hidden.
  	d3.select("#trail").style("visibility", "");
}

////////////////////

function pad(value, length) {
	return (value.toString().length < length) ? pad("0"+value, length):value;
}
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)};
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)};
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)};
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h};
function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)};
function toHex(n) {
 	n = parseInt(n,10);
 	if (isNaN(n)) return "00";
 	n = Math.max(0,Math.min(n,255));
 	return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
};

function buildHierarchyArray() {
	var indiv = getIndividual("I1");
	var indivNode = {"data": {}, "children": [], "size": 1000, "color": "#cccccc"};
	indivNode.data = indiv;

	getChildNodes(indiv, indivNode, indivNode.size / 2, true, "");

	return indivNode;
};
function getChildNodes(indiv, indivNode, size, first, parentColor) {
	var famId = getFamilyId(indiv.id);
	if(famId === undefined) {
		return undefined;
	}

	var fam = getFamily(famId);
	if(fam !== undefined) {
		var mother = getIndividual(fam.wifeId);
		var father = getIndividual(fam.husbandId);

		if(mother !== undefined) {
			var color = first ? "#490000" : (function(c) { 
				var R = hexToR(c), G = hexToG(c), B = hexToB(c);
				return rgbToHex(R, G + 30, B);
			})(parentColor);
			var newNode = {"data": {}, "children": [], "size": size, "color": color}
			newNode.data = mother;
			getChildNodes(mother, newNode, size / 2, false, color);
			indivNode.children.push(newNode);
		}
		if(father !== undefined) {
			var color = first ? "#004900" : (function(c) { 
				var R = hexToR(c), G = hexToG(c), B = hexToB(c);
				return rgbToHex(R, G, B + 30);
			})(parentColor);
			var newNode = {"data": {}, "children": [], "size": size, "color": color}
			newNode.data = father;
			getChildNodes(father, newNode, size / 2, false, color);
			indivNode.children.push(newNode);
		}
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
			hierarchyArray = buildHierarchyArray();

			createVisualization(hierarchyArray);
			initializeBreadcrumbTrail();
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};

window.document.getElementById('fileinput').addEventListener('change', startVis, false);