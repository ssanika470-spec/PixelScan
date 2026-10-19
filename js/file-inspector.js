/**
 * PixelScan - file-inspector.js
 * Page logic: file validation, preview, and wiring the modal component.
 * Everything runs in the browser; no file is uploaded anywhere.
 *
 * NOTE: the "analysis" is a SIMULATION (a progress bar). No real
 * manipulation detection is performed, and the UI says so.
 */
(function () {
  "use strict";

  // --- Feature detection / fallback: need the File API and PixelScanModal ---
  var hasFileApi = !!(window.File && window.FileReader && window.URL && URL.createObjectURL);
  var fileInput = document.getElementById("fileInput");
  var statusEl = document.getElementById("fileStatus");
  if (!fileInput || !statusEl) return;

  if (!hasFileApi || typeof window.PixelScanModal !== "function") {
    fileInput.disabled = true;
    statusEl.className = "error";
    statusEl.textContent = "Your browser does not support file inspection. Please try a modern browser.";
    return;
  }

  // --- Settings ---
  var MAX_SIZE = 20 * 1024 * 1024;                  // 20 MB
  var ALLOWED = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov",
                 "mp3", "wav", "ogg", "m4a", "pdf", "doc", "docx", "txt"];

  // --- Element references ---
  var $ = function (id) { return document.getElementById(id); };
  var nameEl = $("selectedFileName"), typeEl = $("selectedFileType"), sizeEl = $("selectedFileSize");
  var previewEl = $("filePreview");
  var inspectBtn = $("inspectButton"), analyzeBtn = $("analyzeButton"), startBtn = $("startAnalysis");
  var detailsEl = $("fileDetails"), modalStatus = $("modalStatus"), resultEl = $("analysisResult");
  var track = $("progressTrack"), fill = $("progressFill");

  var previewUrl = null;     // object URL for image preview (must be revoked to free memory)
  var timer = null;          // setInterval id for the simulated analysis
  var isAnalyzing = false;

  // --- Modal instance (Week 2 component). Closing is blocked while analysis runs. ---
  var modal;
  try {
    modal = new PixelScanModal($("analysisModal"), {
      canClose: function () {
        if (isAnalyzing) { modalStatus.textContent = "Please wait for the demo to finish."; return false; }
        return true;
      }
    });
  } catch (err) {
    console.error(err);
    statusEl.className = "error";
    statusEl.textContent = "The details window could not start.";
    return;
  }

  // --- Helpers ---
  function extOf(name) { return name.indexOf(".") > -1 ? name.split(".").pop().toLowerCase() : ""; }
  function sizeMB(file) { return (file.size / (1024 * 1024)).toFixed(2) + " MB"; }

  /** Returns an error message, or "" if the file is acceptable. */
  function validate(file) {
    if (file.size === 0) return "Error: This file is empty.";
    if (file.size > MAX_SIZE) return "Error: File exceeds the 20 MB limit (" + sizeMB(file) + ").";
    if (ALLOWED.indexOf(extOf(file.name)) === -1) return "Error: ." + extOf(file.name) + " files are not supported.";
    return "";
  }

  function setLabel(text) {
    var span = document.createElement("span");
    span.className = "file-icon";
    span.textContent = text;
    previewEl.replaceChildren(span);
  }

  function clearPreview() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
    setLabel("FILE");
  }

  function setButtons(enabled) { inspectBtn.disabled = !enabled; analyzeBtn.disabled = !enabled; }

  function stopAnalysis() {
    clearInterval(timer); timer = null;
    isAnalyzing = false; startBtn.disabled = false;
  }

  // --- File selection ---
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    stopAnalysis();
    clearPreview();

    if (!file) {                                   // user cancelled the picker
      nameEl.textContent = "No file selected";
      typeEl.textContent = "Type: —"; sizeEl.textContent = "Size: —";
      statusEl.className = ""; statusEl.textContent = "Choose a file to see its details.";
      setButtons(false);
      return;
    }

    nameEl.textContent = file.name;
    typeEl.textContent = "Type: " + (file.type || extOf(file.name).toUpperCase() || "Unknown");
    sizeEl.textContent = "Size: " + sizeMB(file);

    var error = validate(file);
    statusEl.className = error ? "error" : "success";
    statusEl.textContent = error || "✓ File ready for inspection.";
    setButtons(!error);
    if (error) return;

    if (file.type.indexOf("image/") === 0) {       // image preview with fallback on failure
      previewUrl = URL.createObjectURL(file);
      var img = document.createElement("img");
      img.src = previewUrl;
      img.alt = "";                                // decorative: file name is already shown as text
      img.onerror = function () { setLabel(extOf(file.name).toUpperCase()); };
      previewEl.replaceChildren(img);
    } else {
      setLabel(extOf(file.name).toUpperCase() || "FILE");
    }
  });

  // --- Modal content ---
  function showModal(mode) {
    var file = fileInput.files && fileInput.files[0];
    if (!file || validate(file)) {                 // re-validate: never trust earlier state
      statusEl.className = "error";
      statusEl.textContent = "Please choose a supported file no larger than 20 MB.";
      return;
    }

    // Build file details with textContent (never innerHTML) so file names can't inject markup
    detailsEl.replaceChildren();
    ["File name: " + file.name,
     "File type: " + (file.type || extOf(file.name).toUpperCase()),
     "File size: " + sizeMB(file)].forEach(function (line) {
      var p = document.createElement("p"); p.textContent = line; detailsEl.appendChild(p);
    });

    var inspect = mode === "inspect";
    $("modalTitle").textContent = inspect ? "Inspect File" : "Analyze Selected File";
    modalStatus.textContent = inspect ? "Inspection details ready." : "Ready to start demo analysis.";
    resultEl.textContent = inspect
      ? "File details are shown above. No analysis has been performed."
      : "The progress below is a simulation only; no real manipulation detection is performed.";
    startBtn.hidden = inspect;
    track.hidden = true; fill.style.width = "0%"; track.setAttribute("aria-valuenow", "0");
    modal.open();
  }

  inspectBtn.addEventListener("click", function () { showModal("inspect"); });
  analyzeBtn.addEventListener("click", function () { showModal("analyze"); });

  // --- Simulated analysis: 5 steps x 300 ms = 1.5 s ---
  startBtn.addEventListener("click", function () {
    if (isAnalyzing) return;
    isAnalyzing = true; startBtn.disabled = true; track.hidden = false;
    modalStatus.textContent = "Running simulated analysis...";
    var pct = 0;
    timer = setInterval(function () {
      pct = Math.min(pct + 20, 100);
      fill.style.width = pct + "%";
      track.setAttribute("aria-valuenow", String(pct));
      if (pct === 100) {
        stopAnalysis();
        modalStatus.textContent = "Demo completed.";
        resultEl.textContent = "Demonstration only. No real manipulation detection or risk score was generated.";
      }
    }, 300);
  });
})();
