function onSelectFile_ged(evt: any) {
	let file: any = evt.target.files[0]; 

	if (file) {
		let r = new FileReader();
		r.onload = function onFileLoad(e: any) { 
			let acJSONData = GEDCOMtoACJSON(e.target.result);
			saveAcJSONFile(acJSONData);
		}
		r.readAsText(file);
	} else { 
		return undefined;
	}
};
function onSelectFile_json(evt: any) {
	let file = evt.target.files[0]; 

	if (file) {
		let r = new FileReader();
		r.onload = function onFileLoad(e: any) { 
			let gedData = ACJSONtoGEDCOM(e.target.result);
			saveGEDFile(gedData);
		}
		r.readAsText(file);
	} else { 
		return undefined;
	}
};
function saveAcJSONFile(acJSONData: IAcJSONContainer) {
	let a: any = document.getElementById("downloadlink_json");
	let data = new Blob([JSON.stringify(acJSONData)], {type: 'text/plain'});

	a.href = URL.createObjectURL(data);
	a.innerHTML = "Download AcJSON file here";
};
function saveGEDFile(gedData: any) {
	let a: any = document.getElementById("downloadlink_ged");
	let data = new Blob([gedData], {type: 'text/plain'});

	a.href = URL.createObjectURL(data);
	a.innerHTML = "Download GEDCOM file here";
};
function resetControls() {
	let a1: any = document.getElementById("downloadlink_json");
	let inp1: any = document.getElementById('fileinput_ged');

	let a2: any = document.getElementById("downloadlink_ged");
	let inp2: any = document.getElementById('fileinput_json');

	inp1.value = "";
	a1.innerHTML = "";

	inp2.value = "";
	a2.innerHTML = "";
};

window.document.getElementById('fileinput_ged').addEventListener('change', onSelectFile_ged, false);
window.document.getElementById('downloadlink_json').addEventListener('click', resetControls, false);

window.document.getElementById('fileinput_json').addEventListener('change', onSelectFile_json, false);
window.document.getElementById('downloadlink_ged').addEventListener('click', resetControls, false);
