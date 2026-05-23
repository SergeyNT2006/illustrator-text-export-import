var EXTENSION_VERSION = "5.5.0.0";
// Optional extension root passed from CEP panel (SystemPath.EXTENSION).
var EXTENSION_ROOT_PATH = null;

function asText(input) {
    var value = input;
    if (value instanceof Array) {
        value = value.join("\r");
    }
    return String(value);
}

function normalizePath(pathValue) {
    return String(pathValue).replace(/\\/g, "/");
}

function setExtensionRootPath(pathValue) {
    if (!pathValue) return;
    EXTENSION_ROOT_PATH = normalizePath(pathValue);
}

/** Returns assets folder path, preferring CEP-provided extension root. */
function getAssetsPath() {
    if (EXTENSION_ROOT_PATH) {
        return EXTENSION_ROOT_PATH + "/assets/";
    }
    // Fallback for environments where extension root was not passed.
    return File($.fileName).path + "/../";
}

function readTextFile(relativePath) {
    var filePath = getAssetsPath() + relativePath;
    var inputFile = new File(filePath);
    if (!inputFile.exists) {
        return null;
    }
    if (!inputFile.open("r")) {
        return null;
    }
    var content = inputFile.read();
    inputFile.close();
    return content;
}

function saveTextToFile(defaultName, text) {
    var outFile = File.saveDialog("Save report as TXT", "*.txt");
    if (!outFile) {
        return;
    }
    if (!outFile.open("w")) {
        showAlertDialog("File Error", "Unable to write file:\n" + outFile.fsName);
        return;
    }
    outFile.encoding = "UTF8";
    outFile.write(text);
    outFile.close();
    showAlertDialog("Saved", "Saved:\n" + outFile.fsName);
}

function showTextDialog(title, text, defaultFileName, options) {
    options = options || {};
    var content = asText(text);
    var w = new Window("dialog", title);
    w.orientation = "column";
    w.alignChildren = "fill";
    w.spacing = 8;
    w.margins = 12;

    var editor = w.add("edittext", undefined, content, {
        multiline: true,
        scrolling: true
    });
    editor.minimumSize.width = 760;
    if (options.fixedEditorHeight) {
        editor.minimumSize.height = options.fixedEditorHeight;
        editor.maximumSize.height = options.fixedEditorHeight;
    } else {
        editor.minimumSize.height = 520;
        editor.maximumSize.height = 2000;
    }

    var buttonRow = w.add("group");
    buttonRow.orientation = "row";
    buttonRow.alignment = "right";
    buttonRow.add("button", undefined, "Save as TXT").onClick = function () {
        saveTextToFile(defaultFileName, editor.text);
    };
    buttonRow.add("button", undefined, "Close", { name: "ok" });

    w.show();
}

/**
 * Shows an alert dialog with custom title and scrollable message.
 * Use instead of alert() to avoid truncation and script path in title.
 * @param {string} title   Window title (e.g. "Congratulation!")
 * @param {string} message Message text (can be long, will scroll)
 */
function showAlertDialog(title, message) {
    var w = new Window("dialog", title);
    w.orientation = "column";
    w.alignChildren = "fill";
    w.spacing = 10;
    w.margins = 16;
    var msg = w.add("edittext", undefined, String(message), { multiline: true, scrolling: true });
    msg.minimumSize.width = 480;
    msg.minimumSize.height = 200;
    msg.maximumSize.height = 600;
    msg.readonly = true;
    w.add("button", undefined, "OK", { name: "ok" });
    w.show();
}

function getAboutText() {
    var text = readTextFile("help/about_en.txt");
    if (!text) {
        text = "Illustrator Text Export and Import\nVersion: " + EXTENSION_VERSION + "\n\n(Unable to load about_en.txt from assets/help folder)";
    }
    return asText(text);
}

function getHelpText() {
    var text = readTextFile("help/help_en.txt");
    if (!text) {
        text = "Unable to load help_en.txt from assets/help folder.";
    }
    return asText(text);
}

function showAbout(extensionRootPath) {
    setExtensionRootPath(extensionRootPath);
    showTextDialog("About", getAboutText(), "text_export_import_about.txt", { fixedEditorHeight: 520 });
}

function showHelp(extensionRootPath) {
    setExtensionRootPath(extensionRootPath);
    showTextDialog("Help", getHelpText(), "text_export_import_help.txt", { fixedEditorHeight: 520 });
}