async function loadConfiguration(){
    loadInputDevicesList();

}

async function loadInputDevicesList(){
    let config = getInputConfig();
    let devices = getInputDevices();
    let data = await Promise.all([config, devices]);
    var devicesList = document.getElementById("inputDevicesList");

    data[1].filter(device => device.kind ==="audioinput").forEach((device) =>{
        let opt = createInputDevice(device.deviceId, device.label, data[0]==device.deviceId);
        devicesList.appendChild(opt);
    });

    // remove loading... option and setting the list able
    devicesList.options[0].remove();
    devicesList.removeAttribute("disabled");

    

}
async function getInputConfig(){
    return new Promise(resolve=> {
        window.api.send("getInputDevice", null);
        window.api.receive("savedInputDevice", (data) => {
            resolve(data);
    })});
}
async function getInputDevices() {
    return Promise.resolve(navigator.mediaDevices.enumerateDevices());
}

function createInputDevice(id, name, selected=false){
    let opt = document.createElement("option");
    opt.setAttribute("id", id);
    opt.innerText= name;

    if(selected) opt.setAttribute("selected", "selected")
    return opt;
}

function saveInputDeviceConfig(select){
    let id = select[select.selectedIndex].id;
    window.api.send("saveSelectedInputDevice", id);
}