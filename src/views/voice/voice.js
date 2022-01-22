const voice = (function () {
	const emitter = new window.EventEmitter();
	var modelLang = undefined;
	var modelUrl = undefined;
	var modelStatus = "unloaded";
	var model = undefined;

	var recognizer = undefined;
	var audioSource = undefined;

	const sampleRate = 48000;

	function changeStatus(status) {
		emitter.emit("modelStatusChange", { prev: modelStatus, current: status });
		modelStatus = status;
	}

	async function initModel() {
		model = await Vosk.createModel(modelUrl);

		recognizer = new model.KaldiRecognizer(sampleRate);
		recognizer.setWords(true);

		recognizer.on("result", (message) => {
			emitter.emit("result", message.result);
		});

		recognizer.on("partialresult", (message) => {
			emitter.emit("partialResult", message.result);
		});
	}

	async function loadModel(lang, url, reload = false) {
		try {
			console.debug("Loading model for language: " + lang);
			console.debug("Loading model from: " + url);
			if (!lang || !url) {
				console.error();
			}

			if (modelStatus == "loaded" && !reload) {
				console.debug("Model is already loaded");
				return;
			}

			if (modelStatus == "loading") {
				console.debug("Model is already loading");
				return;
			}

			modelLang = lang;
			modelUrl = url;

			changeStatus("loading");

			await initModel();

			changeStatus("loaded");
		} catch (e) {
			changeStatus("loading_error");
			console.error(e);
		}
	}

	function unloadModel() {
		if (modelStatus == "unloaded") {
			console.debug("Model is already unloaded");
			return;
		}

		if (modelStatus == "running") {
			console.debug("Model is running, stopping");
			stop();
		}

		changeStatus("unloading");

		recognizer.remove();
		model.terminate();
		delete modelLang;
		delete modelUrl;
		delete channel;
		delete model;
		delete recognizer;
		delete audioSource;
		gc();

		changeStatus("unloaded");
	}

	async function start() {
		if (modelStatus != "loaded") {
			console.error("Model is not loaded, current status: " + modelStatus);
			return;
		}

		try {
			let channel = new MessageChannel();

			model.registerPort(channel.port1);
			let mediaStream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					channelCount: 1,
					sampleRate,
				},
			});

			let audioContext = new AudioContext();
			await audioContext.audioWorklet.addModule(
				"voice/recognizer-processor.js"
			);
			let recognizerProcessor = new AudioWorkletNode(
				audioContext,
				"recognizer-processor",
				{ channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 }
			);
			recognizerProcessor.port.postMessage(
				{ action: "init", recognizerId: recognizer.id },
				[channel.port2]
			);
			recognizerProcessor.connect(audioContext.destination);

			audioSource = audioContext.createMediaStreamSource(mediaStream);
			audioSource.connect(recognizerProcessor);
			changeStatus("running");
		} catch (e) {
			changeStatus("running_error");
			console.error(e);
		}
	}

	function stop() {
		if (modelStatus != "running") {
			console.error("Model is not running, current status: " + modelStatus);
			return;
		}

		try {
			audioSource.disconnect();
			changeStatus("loaded");
		} catch (e) {
			changeStatus("stopping_error");
			console.error(e);
		}
	}

	function onPartialResult(callback) {
		emitter.on("partialResult", callback);
	}

	function onResult(callback) {
		emitter.on("result", callback);
	}

	function onModelStatusChange(callback) {
		emitter.on("modelStatusChange", callback);
	}

	return {
		loadModel: loadModel,
		unloadModel: unloadModel,
		start: start,
		stop: stop,

		onPartialResult: onPartialResult,
		onResult: onResult,
		onModelStatusChange: onModelStatusChange,
	};
})();
