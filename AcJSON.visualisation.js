"use strict";

function loadFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			ACJ.Vis.Sunburst.acJSONObj = JSON.parse(e.target.result);

			// Basic setup of page elements.
			ACJ.Vis.Sunburst.initializeBreadcrumbTrail();

			startVis();
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};
function startVis() {
	ACJ.Vis.Sunburst.buildHierarchyArray(ACJ.Vis.Sunburst.startIndividualId);

	ACJ.Vis.Sunburst.vis = d3.select("#chart").append("svg:svg")
		.attr("width", ACJ.Vis.Sunburst.width)
		.attr("height", ACJ.Vis.Sunburst.height)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + ACJ.Vis.Sunburst.width / 2 + "," + ACJ.Vis.Sunburst.height / 2 + ")");

	// Bounding circle underneath the sunburst, to make it easier to detect
	// when the mouse leaves the parent g.
	ACJ.Vis.Sunburst.vis.append("svg:circle").attr("r", ACJ.Vis.Sunburst.radius).style("opacity", 0);

	ACJ.Vis.Sunburst.createVisualization();
	ACJ.Vis.Sunburst.setInitialData();
};
function refreshVis() {
	var chart = document.getElementById("chart");
	chart.removeChild(chart.lastChild);

	startVis();
}

window.document.getElementById('fileinput').addEventListener('change', loadFile, false);