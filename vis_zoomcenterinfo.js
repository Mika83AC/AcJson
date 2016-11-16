"use strict";

var dataSource = {};
var hierarchyArray = {};

//var margin = {top: 350, right: 480, bottom: 350, left: 480};
//var radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;

var width = 1300;
var height = 750;
var visibleRings = 10;
var radius = Math.min(width, height) / 1.8;

var svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
	.sort(function(a, b) { return d3.ascending(a.name, b.name); })
	.size([visibleRings * Math.PI, radius]);

var arc = d3.svg.arc()
	.startAngle(function(d) { return d.x; })
	.endAngle(function(d) { return d.x + d.dx ; })
	.padAngle(.01)
	.padRadius(radius / 3)
	.innerRadius(function(d) { return radius / 8 * d.depth; })
	.outerRadius(function(d) { return radius / 8 * (d.depth + 1) - 1; });

function createVisualization(root) {
  	// Compute the initial layout on the entire tree to sum sizes.
  	// Also compute the full name and fill color for each node,
  	// and stash the children so they can be restored as we descend.
  	partition
	  	.value(function(d) { return d.size; })
	  	.nodes(root)
	  	.forEach(function(d) {
			d._children = d.children;
			d.sum = d.value;
			d.key = key(d);
			d.fill = d.color;
		});

  	// Now redefine the value function to use the previously-computed sum.
  	partition
	  	.children(function(d, depth) { return depth < visibleRings ? d._children : null; })
	  	.value(function(d) { return d.sum; });

  	var center = svg.append("circle")
	  	.attr("r", radius / 3)
	  	.on("click", zoomOut);

  	center.append("title").text("zoom out");

  	var path = svg.selectAll("path")
	  	.data(partition.nodes(root).slice(1))
		.enter().append("path")
	  	.attr("d", arc)
	  	.style("fill", function(d) { return d.fill; })
	  	.each(function(d) { this._current = updateArc(d); })
	  	.append("title")
	  	.text(function(d) { return d.data.preNames + ' '  + d.data.lastNames_Birth; }) 
	  	.on("click", zoomIn);

  	function zoomIn(p) {
		if (p.depth > 1) p = p.parent;
		if (!p.children) return;
		zoom(p, p);
  	}

  	function zoomOut(p) {
		if (!p.parent) return;
		zoom(p.parent, p);
  	}

  	// Zoom to the specified new root.
  	function zoom(root, p) {
		if (document.documentElement.__transition__) return;

		// Rescale outside angles to match the new layout.
		var enterArc, exitArc, outsideAngle = d3.scale.linear().domain([0, visibleRings * Math.PI]);

		function insideArc(d) {
		  	return p.key > d.key
			  	? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
			  	? {depth: d.depth - 1, x: visibleRings * Math.PI, dx: 0}
			  	: {depth: 0, x: 0, dx: visibleRings * Math.PI};
		}

		function outsideArc(d) {
	  		return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
		}

		center.datum(root);

		// When zooming in, arcs enter from the outside and exit to the inside.
		// Entering outside arcs start from the old layout.
		if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

		path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });

		// When zooming out, arcs enter from the inside and exit to the outside.
		// Exiting outside arcs transition to the new layout.
		if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

		d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
	  		path.exit().transition()
		  	.style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
		  	.attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
		  	.remove();

		  	path.enter().append("path")
			  	.style("fill-opacity", function(d) { return d.depth === visibleRings - (root === p) ? 1 : 0; })
			  	.style("fill", function(d) { return d.fill; })
			  	.on("click", zoomIn)
			  	.each(function(d) { this._current = enterArc(d); 
			  	});

		  	path.transition()
			  	.style("fill-opacity", 1)
			  	.attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); 
		});
	});
  }
};

function key(d) {
  	var k = [], p = d;
  	while (p.depth) k.push(p.name), p = p.parent;
  	return k.reverse().join(".");
}

function arcTween(b) {
  	var i = d3.interpolate(this._current, b);
  	this._current = i(0);
  	return function(t) {
		return arc(i(t));
  	};
}

function updateArc(d) {
  	return {depth: d.depth, x: d.x, dx: d.dx};
}

d3.select(self.frameElement).style("height", height + "px");

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
			//initializeBreadcrumbTrail();
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};

window.document.getElementById('fileinput').addEventListener('change', startVis, false);