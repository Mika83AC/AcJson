"use strict";

function onSelectFile(evt) {
	var file = evt.target.files[0]; 

	if (file) {
		var r = new FileReader();
		r.onload = function(e) { 
			var acJSONData = gedcomToAcJSON(e.target.result);
			saveAcJSONFile(acJSONData);
		}
		r.readAsText(file);
	} else { 
		return undefined;
	}
};
function saveAcJSONFile(acJSONData) {
	var a = document.getElementById("downloadlink");
	var data = new Blob([acJSONData], {type: 'text/plain'});

	a.href = URL.createObjectURL(data);
	a.innerHTML = "Download AcJSON file here";
};
function resetControls() {
	var a = document.getElementById("downloadlink");
	var inp = document.getElementById('fileinput');

	inp.value = "";
	a.innerHTML = "";
};

window.document.getElementById('fileinput').addEventListener('change', onSelectFile, false);
window.document.getElementById('downloadlink').addEventListener('click', resetControls, false);
