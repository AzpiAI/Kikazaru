for (let lang in window.models) {
    document.getElementById(
        "languageChooser"
    ).innerHTML += `<option value="${lang}" data-i18n="${window.models[lang].name}"></option>`;
}
// TODO remove when stop testing
voice.onPartialResult(function (result) {
    window.electron.ipcRenderer.send("partialResult", result);
});

voice.onResult(function (result) {
    window.electron.ipcRenderer.send("result", result);
});
voice.onModelStatusChange(function (status) {
    document.getElementById("modelStatus").innerHTML = status.current;
});

document
    .getElementById("link")
    .addEventListener("click", function (event) {
        event.preventDefault();
        window.electron.shell.openExternal(this.href);
    });
// document
//     .getElementById("lang")
//     .addEventListener("onchange", function (event) {
//         event.preventDefault();
//         // document.getElementById("lang").disabled = true;

//         voice.loadModel(
//             document.getElementById("lang").value,
//             window.models[document.getElementById("lang").value].url
//         );
//     });

document
    .getElementById("stop")
    .addEventListener("click", function (event) {
        event.preventDefault();
        stopRecognising();
    });
