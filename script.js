
// =====================================
// 1. MOBILE NAVIGATION MENU
// =====================================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

// Open or close the mobile menu.
menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the menu after selecting a navigation link.
navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.textContent = "☰";
    });
});


// =====================================
// 2. GET UPLOAD ELEMENTS
// =====================================

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

const selectedFile = document.getElementById("selected-file");
const fileName = document.getElementById("file-name");
const fileSize = document.getElementById("file-size");

const removeFileButton = document.getElementById("remove-file");
const analyzeButton = document.getElementById("analyze-button");

const uploadError = document.getElementById("upload-error");
const demoMessage = document.getElementById("demo-message");

let currentFile = null;

// Maximum file size for this prototype: 25 MB.
const MAX_FILE_SIZE = 25 * 1024 * 1024;


// =====================================
// 3. VALIDATE FILES
// =====================================

function isSupportedFile(file) {
    const fileName = file.name.toLowerCase();

    const supportedExtensions = [
        ".jpg", ".jpeg", ".png", ".webp",
        ".gif", ".bmp",
        ".mp4", ".webm", ".mov",
        ".mp3", ".wav", ".ogg", ".m4a",
        ".pdf", ".doc", ".docx", ".txt"
    ];

    return supportedExtensions.some(function (extension) {
        return fileName.endsWith(extension);
    });
}


// Format file size into KB or MB.
function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}


// =====================================
// 4. DISPLAY THE SELECTED FILE
// =====================================

function handleFile(file) {
    // Clear any previous error or demo result.
    uploadError.textContent = "";
    demoMessage.hidden = true;
    demoMessage.textContent = "";

    if (!file) {
        return;
    }

    if (!isSupportedFile(file)) {
        uploadError.textContent =
            "Unsupported file type. Choose an image, video, audio or supported document.";
        return;
    }

    if (file.size === 0) {
        uploadError.textContent =
            "This file is empty. Please select another file.";
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        uploadError.textContent =
            "The file exceeds the 25 MB prototype limit.";
        return;
    }

    currentFile = file;

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    selectedFile.hidden = false;
    analyzeButton.disabled = false;
}


// =====================================
// 5. BROWSE FILES
// =====================================

// Clicking the upload area opens the file picker.
dropZone.addEventListener("click", function () {
    fileInput.click();
});

// Also support keyboard users.
dropZone.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
    }
});

// Handle a file selected from the computer.
fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
    }
});


// =====================================
// 6. DRAG AND DROP
// =====================================

// Prevent the browser from opening a dropped file.
["dragenter", "dragover", "dragleave", "drop"].forEach(
    function (eventName) {
        dropZone.addEventListener(eventName, function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    }
);

// Highlight the upload area while dragging.
["dragenter", "dragover"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function () {
        dropZone.classList.add("drag-over");
    });
});

// Remove the highlight when dragging ends.
["dragleave", "drop"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function () {
        dropZone.classList.remove("drag-over");
    });
});

// Read the dropped file.
dropZone.addEventListener("drop", function (event) {
    const files = event.dataTransfer.files;

    if (files.length > 0) {
        handleFile(files[0]);
    }
});


// =====================================
// 7. REMOVE SELECTED FILE
// =====================================

removeFileButton.addEventListener("click", function () {
    currentFile = null;
    fileInput.value = "";

    selectedFile.hidden = true;
    analyzeButton.disabled = true;

    uploadError.textContent = "";
    demoMessage.textContent = "";
    demoMessage.hidden = true;
});


// =====================================
// 8. DEMONSTRATE THE WORKFLOW
// =====================================

analyzeButton.addEventListener("click", function () {
    if (!currentFile) {
        uploadError.textContent = "Please select a file first.";
        return;
    }

    demoMessage.hidden = false;

    demoMessage.textContent =
        "File selected: " + currentFile.name +
        ". The upload interface is working, but the AI detection " +
        "backend is not connected yet. No manipulation score has " +
        "been calculated and no authenticity conclusion has been made.";
});

// =====================================
// SMOOTH SCROLL REVEAL
// =====================================

const revealElements = document.querySelectorAll(
    ".section-heading, .feature-card, .step-card, .upload-card, .final-cta-inner"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
        element.classList.add("visible");
    });
} else {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(function (element) {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
}
