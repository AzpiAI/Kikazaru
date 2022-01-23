async function loadConfiguration() {
	window.i18n.changeLanguage(navigator.language);
	navigator.mediaDevices.ondevicechange = (evt) => {
		loadInputDevicesList();
	}
	loadInputDevicesList();
}

async function loadInputDevicesList() {
	console.log("Loading input devices list");
	let config = await getInputConfig();
	console.log("Input config:", config);
	let devices = await getInputDevices();
	console.log("Input devices:", devices);
	let data = [config, devices];
	console.log("Input data:", data);
	var devicesList = document.getElementById("inputDevicesList");
	console.log(data);
	console.log(data[0]);
	console.log(data[1]);
	console.log(devicesList);

	// remove loading... option and setting the list able
	devicesList.innerHTML = '';
	devicesList.removeAttribute("disabled");

	data[1]
		.filter((device) => device.kind === "audioinput")
		.forEach((device) => {
			let opt = createInputDevice(
				device.deviceId,
				device.label,
				data[0] == device.deviceId
			);
			devicesList.appendChild(opt);
		});

	// remove loading... option and setting the list able
	devicesList.options[0].remove();
	devicesList.removeAttribute("disabled");
}
async function getInputConfig() {
	return new Promise((resolve) => {
		window.api.send("getInputDevice", null);
		window.api.receive("savedInputDevice", (data) => {
			resolve(data);
		});
	});
}
async function getInputDevices() {
	return Promise.resolve(navigator.mediaDevices.enumerateDevices());
}

function createInputDevice(id, name, selected = false) {
	let opt = document.createElement("option");
	opt.setAttribute("id", id);
	opt.innerText = name;

	if (selected) opt.setAttribute("selected", "selected");
	return opt;
}

function saveInputDeviceConfig(select) {
	let id = select[select.selectedIndex].id;
	window.api.send("saveSelectedInputDevice", id);
}

function getSelectedInputDevice(){
	let select = document.getElementById("inputDevicesList");
	return select[select.selectedIndex].id;
}