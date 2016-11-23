"use strict";

function loadFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			dataSource = JSON.parse(e.target.result);

			// Basic setup of page elements.
			initializeBreadcrumbTrail();

			startVis();
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};
function startVis() {
	hierarchyArray = buildHierarchyArray(startIndividualId);

	vis = d3.select("#chart").append("svg:svg")
		.attr("width", width)
		.attr("height", height)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	// Bounding circle underneath the sunburst, to make it easier to detect
	// when the mouse leaves the parent g.
	vis.append("svg:circle").attr("r", radius).style("opacity", 0);

	createVisualization(hierarchyArray);
	setInitialData(hierarchyArray);
};
function refreshVis() {
	var chart = document.getElementById("chart");
	chart.removeChild(chart.lastChild);

	startVis();
}

window.document.getElementById('fileinput').addEventListener('change', loadFile, false);