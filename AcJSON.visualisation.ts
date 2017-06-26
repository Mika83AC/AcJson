var sunburst = SunburstFactory();

function loadFile(evt: any) {
	var file = evt.target.files[0];

	if (file) {
		var r = new FileReader();
		r.onload = function(e: any) {
			sunburst.acJSONObj = JSON.parse(e.target.result);

			// Basic setup of page elements.
			sunburst.initializeBreadcrumbTrail();

			startVis();
		}
		r.readAsText(file);
	} else {
		alert("Failed to load file");
	}
};
function startVis() { 
	sunburst.buildHierarchyArray(sunburst.startIndividualId);

	sunburst.vis = d3.select("#chart").append("svg:svg")
		.attr("width", sunburst.width)
		.attr("height", sunburst.height)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + sunburst.width / 2 + "," + sunburst.height / 2 + ")");

	sunburst.vis.append("svg:circle").attr("r", sunburst.radius).style("opacity", 0);

	sunburst.createVisualization();
	sunburst.setInitialData();
};

function refreshVis() {
	var chart: any = document.getElementById("chart");
	chart.removeChild(chart.lastChild);

	startVis();
};

window.document.getElementById('fileinput').addEventListener('change', loadFile, false);
