"use strict";

var dataSource = {};

var width = 1200;
var height = 900;
var radius = (Math.min(width, height) / 2) - 10;

var x = d3.scale.linear().range([0, 2 * Math.PI]);
var y = d3.scale.sqrt().range([0, radius]);

var b = { w: 200, h: 30, s: 3, t: 10 };

var partition = d3.layout.partition().value(function(d) { return d.size; });
var arc = d3.svg.arc()
	.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
	.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
	.innerRadius(function(d) { return Math.max(0, y(d.y)); })
	.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
var svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

function click(d) {Node
  	svg.transition()
		.duration(750)
		.tween("scale", function() {
		  	var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
			var yd = d3.interpolate(y.domain(), [d.y, 1]);
			var yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);

		  return function(t) { 
		  		x.domain(xd(t)); 
		  		y.domain(yd(t)).range(yr(t)); 
		  	};
		})
	 	.selectAll("path")
		.attrTween("d", function(d) { 
			return function() { 
				return arc(d); 
			}; 
	});

	var sequenceArray = getAncestorNodes(d);
	updateBreadcrumbs(sequenceArray, d.name);
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
function updateBreadcrumbs(nodeArray, percentageString) {
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name; });

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
  d3.select("#trail").style("visibility", "");
}

function getAncestorNodes(node) {
  	var path = [];
  	var current = node;
  	while (current.parent) {
    	path.unshift(current);
    	current = current.parent;
  	}
  	return path;
}

function pad(value, length) {
   return (value.toString().length < length) ? pad("0"+value, length):value;
}

function buildHierarchyArray() {
	var indiv = getIndividual("I1");
	var indivNode = {"name": "", "children": [], "size": 1000, "color": "#cccccc"};
	indivNode.name = indiv.preNames + ' ' + indiv.lastNames_Birth;

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
				var valToChange = parseInt(c.substring(3, 5)) + 10;
				return c.substring(0, 3) + pad(valToChange, 2) + c.substring(5, 7); 
			})(parentColor);
			var newNode = {"name": "", "children": [], "size": size, "color": color}
			newNode.name = mother.preNames + ' ' + mother.lastNames_Birth;
			getChildNodes(mother, newNode, size / 2, false, color);
			indivNode.children.push(newNode);
		}
		if(father !== undefined) {
			var color = first ? "#004900" : (function(c) { 
				var valToChange = parseInt(c.substring(5, 7)) + 10;
				return c.substring(0, 5) + pad(valToChange, 2); 
			})(parentColor);
			var newNode = {"name": "", "children": [], "size": size, "color": color}
			newNode.name = father.preNames + ' ' + father.lastNames_Birth;
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

			var hierarchyArray = buildHierarchyArray();

			initializeBreadcrumbTrail();

		  	svg.selectAll("path")
				.data(partition.nodes(hierarchyArray))
			 	.enter().append("path")
				.attr("d", arc)
				.style("fill", function(d) { return d.color; })
				.on("click", click)
			 	.append("title")
				.text(function(d) { return d.name; 
			});
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};

window.document.getElementById('fileinput').addEventListener('change', startVis, false);

d3.select(self.frameElement).style("height", height + "px");