"use strict";

function onSelectFile_ged(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			var acJSONData = GEDCOMtoAcJSON(e.target.result);
			saveAcJSONFile(acJSONData);
		}
		r.readAsText(file);
	} else { 
		return undefined;
	}
};
function onSelectFile_json(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			var gedData = AcJSONtoGEDCOM(e.target.result);
			saveGEDFile(gedData);
		}
		r.readAsText(file);
	} else { 
		return undefined;
	}
};
function saveAcJSONFile(acJSONData) {
	var a = document.getElementById("downloadlink_json");
	var data = new Blob([acJSONData], {type: 'text/plain'});

	a.href = URL.createObjectURL(data);
	a.innerHTML = "Download AcJSON file here";
};
function saveGEDFile(gedData) {
	var a = document.getElementById("downloadlink_ged");
	var data = new Blob([acJSONData], {type: 'text/plain'});

	a.href = URL.createObjectURL(data);
	a.innerHTML = "Download GEDCOM file here";
};
function resetControls() {
	var a1 = document.getElementById("downloadlink_json");
	var inp1 = document.getElementById('fileinput_ged');

	var a2 = document.getElementById("downloadlink_ged");
	var inp2 = document.getElementById('fileinput_json');

	inp1.value = "";
	a1.innerHTML = "";

	inp2.value = "";
	a2.innerHTML = "";
};

window.document.getElementById('fileinput_ged').addEventListener('change', onSelectFile_ged, false);
window.document.getElementById('downloadlink_json').addEventListener('click', resetControls, false);

window.document.getElementById('fileinput_json').addEventListener('change', onSelectFile_json, false);
window.document.getElementById('downloadlink_ged').addEventListener('click', resetControls, false);
