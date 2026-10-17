
"use strict";

// =====================================
// 1. GET THE HTML ELEMENTS
// =====================================

const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileName");

// Maximum file size: 25 MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;


// =====================================
// 2. SUPPORTED FILE TYPES
// =====================================

function isSupportedFile(file) {
    const fileName = file.name.toLowerCase();

    const supportedExtensions = [
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp",
        ".mp4", ".webm", ".mov",
        ".mp3", ".wav", ".ogg", ".m4a",
        ".pdf", ".doc", ".docx", ".txt"
    ];

    return supportedExtensions.some(function (extension) {
        return fileName.endsWith(extension);
    });
}


// =====================================
// 3. FORMAT FILE SIZE
// =====================================

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


// =====================================
// 4. DISPLAY A MESSAGE
// =====================================

function showFileMessage(message, isError = false) {
    fileNameDisplay.textContent = message;

    // Apply red styling to error messages.
    fileNameDisplay.classList.toggle("file-error", isError);

    // Announce errors to assistive technology.
    if (isError) {
        fileNameDisplay.setAttribute("role", "alert");
    } else {
        fileNameDisplay.removeAttribute("role");
    }
}


// =====================================
// 5. VALIDATE THE SELECTED FILE
// =====================================

function handleFileSelection(file) {
    if (!file) {
        fileNameDisplay.textContent = "";
        fileNameDisplay.classList.remove("file-error");
        return;
    }

    // Check whether the extension is supported.
    if (!isSupportedFile(file)) {
        showFileMessage(
            "Unsupported file type. Please select a supported image, video, audio file or document.",
            true
        );

        fileInput.value = "";
        return;
    }

    // Reject empty files.
    if (file.size === 0) {
        showFileMessage(
            "This file is empty. Please select another file.",
            true
        );

        fileInput.value = "";
        return;
    }

    // Enforce the prototype's file-size limit.
    if (file.size > MAX_FILE_SIZE) {
        showFileMessage(
            "This file exceeds the 25 MB limit. Please choose a smaller file.",
            true
        );

        fileInput.value = "";
        return;
    }

    // Display the selected filename and size.
    showFileMessage(
        "Selected: " + file.name + " · " + formatFileSize(file.size)
    );
}


// =====================================
// 6. HANDLE FILE SELECTION
// =====================================

if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", function () {
        const selectedFile = fileInput.files[0];

        handleFileSelection(selectedFile);
    });
} else {
    console.error(
        "PixelScan: Could not find #fileInput or #fileName. Check the IDs in index.html."
    );
}
