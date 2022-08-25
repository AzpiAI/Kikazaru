for (let lang in window.models) {
	document.getElementById(
		"languageChooser"
	).innerHTML += `<option value="${lang}" data-i18n="${window.models[lang].name}"></option>`;
}
voice.onPartialResult(function (result) {
	window.electron.ipcRenderer.send("partialResult", result);
});

voice.onResult(function (result) {
	window.electron.ipcRenderer.send("result", result);
});
document
	.getElementById("openServer")
	.addEventListener("click", function (event) {
		event.preventDefault();
		window.electron.shell.openExternal(this.href);
	});
