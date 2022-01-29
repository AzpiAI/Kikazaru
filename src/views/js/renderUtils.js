async function loadConfiguration() {
    window.i18n.changeLanguage(navigator.language);
    navigator.mediaDevices.ondevicechange = (evt) => {
        loadInputDevicesList();
    }
    loadInputDevicesList();
    loadServerHost();
    voice.onModelStatusChange((status) => {
        changeStatus(status);
    });

    window.api.receive("serverStart", (data) => {
        loadServerHost(data);
    });
}

async function loadInputDevicesList() {
    let config = await getInputConfig();
    let devices = await getInputDevices();
    let data = [config, devices];
    var devicesList = document.getElementById("inputDevicesList");

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

function getSelectedInputDevice() {
    let select = document.getElementById("inputDevicesList");
    return select[select.selectedIndex].id;
}

function startRecognising() {
    document.getElementById("inputDevicesList").disabled = true;
    document.getElementById("languageChooser").disabled = true;
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
    voice.start();
}

function stopRecognising() {
    document.getElementById("inputDevicesList").disabled = false;
    document.getElementById("languageChooser").disabled = false;
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
    voice.stop();
}



async function loadLanguage(select) {
    //if is some language previously loaded, unload it
    if (voice.modelStatus !== "unloaded")
        voice.unloadModel();

    //load the selected model
    var lang = select[select.selectedIndex].value;
    loadingLanguage(true);
    await voice.loadModel(
        lang,
        window.models[lang].url
    );
    loadingLanguage(false);
}

function loadingLanguage(isLoading) {
    let chooser = document.getElementById("languageChooser");
    let loadingCircle = document.getElementById("loadingCircle");
    let start = document.getElementById("start");
    if (isLoading) {
        chooser.disabled = true;
        start.disabled = true;
        loadingCircle.style.display = "inline-block";

    } else {
        chooser.disabled = false;
        start.disabled = false;
        loadingCircle.style.display = "none";
    }
}

function changeStatus(status) {
    document.getElementById("currentStatus").remove();
    document.getElementById("statusPanel").innerHTML += `<span id="currentStatus" data-i18n="status.${status}" class="status-${status}"></span>`;
    window.i18n.localize("#statusPanel");
}

function loadServerHost(host) {
    this.document.getElementById("txtServerHost").value = host;
    this.document.getElementById("openServer").href = host;
}


function copyToCLipboardElement(parent) {
    let elem = parent.children[0];
    elem.select();
    elem.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(elem.value);
}