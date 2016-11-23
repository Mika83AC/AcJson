"use strict";

function loadFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			AcJSON.Vis.Sunburst.acJSONObj = JSON.parse(e.target.result);

			// Basic setup of page elements.
			AcJSON.Vis.Sunburst.initializeBreadcrumbTrail();

			startVis();
		}
		r.readAsText(file);
	} else { 
		alert("Failed to load file");
	}
};
function startVis() {
	AcJSON.Vis.Sunburst.buildHierarchyArray(AcJSON.Vis.Sunburst.startIndividualId);

	AcJSON.Vis.Sunburst.vis = d3.select("#chart").append("svg:svg")
		.attr("width", AcJSON.Vis.Sunburst.width)
		.attr("height", AcJSON.Vis.Sunburst.height)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + AcJSON.Vis.Sunburst.width / 2 + "," + AcJSON.Vis.Sunburst.height / 2 + ")");

	// Bounding circle underneath the sunburst, to make it easier to detect
	// when the mouse leaves the parent g.
	AcJSON.Vis.Sunburst.vis.append("svg:circle").attr("r", AcJSON.Vis.Sunburst.radius).style("opacity", 0);

	AcJSON.Vis.Sunburst.createVisualization();
	AcJSON.Vis.Sunburst.setInitialData();
};
function refreshVis() {
	var chart = document.getElementById("chart");
	chart.removeChild(chart.lastChild);

	startVis();
}

window.document.getElementById('fileinput').addEventListener('change', loadFile, false);