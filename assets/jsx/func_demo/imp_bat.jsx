#target illustrator
#include "_shared.jsx"
var DEMO_FILE_LIMIT = 5;

function getBatchImportSuffixFromDialog(allLanguages, favoriteLanguages, defaultTag) {
    var w = new Window("dialog", "Batch Import Language Suffix");
    w.orientation = "column";
    w.alignChildren = "fill";
    w.spacing = 8;
    w.margins = 14;

    var intro = w.add("statictext", undefined, "Select language suffix for output file names.");
    intro.alignment = "left";
    var hint = w.add("statictext", undefined, "Suffix format: _<tag> (example: _en, _de, _pt-BR)");
    hint.alignment = "left";

    var favoriteCheckbox = w.add("checkbox", undefined, "Use only favorite language");
    favoriteCheckbox.value = false;

    var listPanel = w.add("panel", undefined, "Language");
    listPanel.orientation = "column";
    listPanel.alignChildren = "fill";
    listPanel.margins = 10;
    var languageList = listPanel.add("dropdownlist", undefined, []);
    languageList.minimumSize.width = 360;

    var currentList = allLanguages;

    function refillList(listToUse, preferredTag) {
        languageList.removeAll();
        var preferredIndex = -1;
        for (var i = 0; i < listToUse.length; i++) {
            var itemText = listToUse[i].tag + " | " + listToUse[i].label;
            languageList.add("item", itemText);
            if (listToUse[i].tag === preferredTag) preferredIndex = i;
        }
        if (preferredIndex === -1) preferredIndex = 0;
        languageList.selection = preferredIndex;
    }

    function getSelectedTag() {
        if (!currentList || currentList.length === 0) return defaultTag;
        var idx = languageList.selection ? languageList.selection.index : 0;
        if (idx < 0 || idx >= currentList.length) idx = 0;
        return currentList[idx].tag;
    }

    refillList(currentList, defaultTag);

    favoriteCheckbox.onClick = function () {
        var prevTag = getSelectedTag();
        if (favoriteCheckbox.value && favoriteLanguages.length === 0) {
            showAlertDialog("Batch Import Warning", "Favorite language list is empty.");
            favoriteCheckbox.value = false;
        }
        currentList = (favoriteCheckbox.value && favoriteLanguages.length > 0) ? favoriteLanguages : allLanguages;
        refillList(currentList, prevTag);
    };

    var buttons = w.add("group");
    buttons.orientation = "row";
    buttons.alignment = "right";
    var okBtn = buttons.add("button", undefined, "OK", { name: "ok" });
    var cancelBtn = buttons.add("button", undefined, "Cancel", { name: "cancel" });

    cancelBtn.onClick = function () { w.close(0); };
    okBtn.onClick = function () { w.close(1); };

    var result = w.show();
    if (result !== 1) {
        return { wasCanceled: true, suffix: "" };
    }

    return { wasCanceled: false, suffix: "_" + getSelectedTag() };
}

function imp_bat() {
    var xmlFile = File.openDialog("Select an translated XML file", "*.xml");
    if (!xmlFile) {
        return "CANCEL";
    }
    xmlFile.encoding = "UTF-8";
    xmlFile.open("r");
    var xmlContent = xmlFile.read();
    var xmlDoc = new XML(xmlContent);
    if (!xmlDoc.folder || !xmlDoc.extension || xmlDoc.file.length() === 0) {
        var structureErr = "Invalid batch XML structure.\nRequired nodes: <folder>, <extension>, and at least one <file>.";
        showAlertDialog("Import Error", structureErr);
        return "ERROR: " + structureErr;
    }

    var folder = xmlDoc.folder.toString();
    var extension = xmlDoc.extension.toString();
    if (!(extension === ".ai" || extension === ".eps" || extension === ".svg")) {
        var extErr = "Unsupported extension in batch XML: " + extension + "\nAllowed: .ai, .eps, .svg";
        showAlertDialog("Import Error", extErr);
        return "ERROR: " + extErr;
    }
    var allLanguages = loadBcp47LanguageList("Batch Import Warning");
    var favoriteLanguages = loadBcp47FavoriteLanguageList("Batch Import Warning");
    var langSelect = getBatchImportSuffixFromDialog(allLanguages, favoriteLanguages, "en");
    if (langSelect.wasCanceled) {
        return "CANCEL";
    }
    var lang = langSelect.suffix;

    var confirmWin = new Window("dialog", "Batch Import");
    confirmWin.orientation = "column";
    confirmWin.alignChildren = ["fill", "center"];
    confirmWin.spacing = 10;
    confirmWin.margins = 16;
    confirmWin.add("statictext", undefined, "Please wait for the work to complete.");
    confirmWin.add("statictext", undefined, "The import will start only after you click OK.");
    confirmWin.add("statictext", undefined, "The interface may freeze; please wait for the success message.");
    var btnGroup = confirmWin.add("group");
    btnGroup.alignment = "center";
    var okBtn = btnGroup.add("button", undefined, "OK", { name: "ok" });
    var cancelBtn = btnGroup.add("button", undefined, "Cancel", { name: "cancel" });
    cancelBtn.onClick = function () { confirmWin.close(0); };
    okBtn.onClick = function () { confirmWin.close(1); };
    if (confirmWin.show() !== 1) {
        return "CANCEL";
    }

    var totalFoundFiles = xmlDoc.file.length();
    var fileCount = Math.min(totalFoundFiles, DEMO_FILE_LIMIT);
    var startTime = new Date();
    var processedCount = 0;
    var skippedFiles = [];
    var totalFrames = 0;

    for (var f = 0; f < fileCount; f++)
    {
        var shortFileName = "";
        var idoc = null;

        try
        {
            if (!xmlDoc.file[f].CharacterStyles || xmlDoc.file[f].CharacterStyles.s.length() === 0) {
                var pathAttr = xmlDoc.file[f].@Name;
                shortFileName = pathAttr ? new File(decodeURI(pathAttr.toString())).name : ("file index " + f);
                throw new Error("Missing CharacterStyles");
            }
            if (!xmlDoc.file[f].frame || xmlDoc.file[f].frame.length() === 0) {
                var pathAttr = xmlDoc.file[f].@Name;
                shortFileName = pathAttr ? new File(decodeURI(pathAttr.toString())).name : ("file index " + f);
                throw new Error("Missing frame nodes");
            }

            var fullPath = decodeURI(String(xmlDoc.file[f].@Name));
            shortFileName = new File(fullPath).name;
            var fileToOpen = new File(fullPath);
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
            idoc = app.open(fileToOpen);
            app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
            var parts = fullPath.split(".");
            var OnlyName = parts.slice(0, -1).join(".");
            var saveName = new File(OnlyName + lang + extension);

        for (var i = 0; i < xmlDoc.file[f].CharacterStyles.s.length(); i++)
        {
            var styleNode = xmlDoc.file[f].CharacterStyles.s[i];
            var styleId = parseInt(styleNode.@id, 10);
            var values = styleNode.toString().split(',');
            var fontFamily = values[0];
            var fontStyle = values[1];
            var fontInternalName = values[2];
            var fontSize = parseFloat(values[3]);
            var fontCyan = parseInt(values[4], 10);
            var fontMagenta = parseInt(values[5], 10);
            var fontYellow = parseInt(values[6], 10);
            var fontBlack = parseInt(values[7], 10);
            var fullCMYK = [fontCyan, fontMagenta, fontYellow, fontBlack].join(",");
            var fullFontName = fontFamily + "-" + fontStyle
            var styleName = styleId + "_" + fullFontName + "_" + fontSize + "pt_" + "CMYK-" + fullCMYK;
            
            var charStyle;
            try {
                charStyle = idoc.characterStyles.getByName(styleName);
            } catch (e) {
                charStyle = idoc.characterStyles.add(styleName);
                var fullFontNameVariants = [
                    fontInternalName,
                    fontFamily + "-" + fontStyle,
                    fontFamily + fontStyle,
                    fontFamily + " " + fontStyle,
                    fontFamily
                ];
                var foundFont = null;
                for (var v = 0; v < fullFontNameVariants.length; v++) {
                    try {
                        foundFont = app.textFonts.getByName(fullFontNameVariants[v]);
                        if (foundFont) break;
                    } catch (e) {}
                }
                if (foundFont) {
                    charStyle.characterAttributes.textFont = foundFont;
                } else {
                    showAlertDialog('Import Warning', "Font not found: " + fontFamily + " " + fontStyle + " (id=" + styleId + "). The style will be created without font assignment.");
                }
                var charAttr = charStyle.characterAttributes;
                charAttr.size = fontSize;
                var CharColor = new CMYKColor();
                CharColor.cyan = fontCyan;
                CharColor.magenta = fontMagenta;
                CharColor.yellow = fontYellow;
                CharColor.black = fontBlack;
                charAttr.fillColor = CharColor;
            }
        }

        for (var i = 0; i < idoc.textFrames.length; i++)
        {
            var text = xmlDoc.file[f].frame[i].text.toString();
            idoc.textFrames[i].contents = text;
        }

        for (var d = 0; d < idoc.textFrames.length; d++)
        {
            for (var j = 0; j < idoc.textFrames[d].paragraphs.length; j++)
            {
                if (/^\s+$/.test(idoc.textFrames[d].paragraphs[j].contents))
                {
                    idoc.textFrames[d].paragraphs[j].contents = "";
                }
            }
        }

        totalFrames += xmlDoc.file[f].frame.length();

        if (extension == ".ai")
        {
            idoc.saveAs(saveName);
        }
        else if (extension == ".eps")
        {
            var saveOpts = new EPSSaveOptions();
            saveOpts.cmykPostScript = true;
            saveOpts.compatibility = Compatibility.ILLUSTRATOR16;
            saveOpts.embedAllFonts = false;
            saveOpts.embedLinkedFiles = false;
            saveOpts.includeDocumentThumbnails = false;
            saveOpts.postScript = EPSPostScriptLevelEnum.LEVEL3;
            saveOpts.preview = EPSPreview.None;
            saveOpts.saveMultipleArtboards = false;
            idoc.saveAs(saveName, saveOpts);
        }
        else
        {
            var exportOptions = new ExportOptionsSVG();
            exportOptions.embedRasterImages = true;
            exportOptions.embedAllFonts = false;
            exportOptions.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;
            var type = ExportType.SVG;
            idoc.exportFile(saveName, type, exportOptions);
        }
        idoc.close();
        idoc = null;
        processedCount++;
        }
        catch (e)
        {
            if (idoc) {
                try { idoc.close(SaveOptions.DONOTSAVECHANGES); } catch (closeErr) {}
            }
            skippedFiles.push(shortFileName || ("file index " + f));
        }
        $.gc();
    }

    var endTime = new Date();
    var elapsedSec = Math.round((endTime - startTime) / 1000);
    var elapsedStr = (elapsedSec < 60) ? elapsedSec + " sec" : Math.floor(elapsedSec / 60) + " min " + (elapsedSec % 60) + " sec";

    var report = "Batch Import - complete\n\n";
    report += "Processed files: " + processedCount + "\n";
    report += "Found files: " + totalFoundFiles + "\n";
    report += "Total text frames: " + totalFrames + "\n";
    report += "Time elapsed: " + elapsedStr + "\n";
    report += "Output folder: " + folder + "\n";
    report += "Suffix: " + lang + "\n";
    report += "DEMO MODE: only first " + DEMO_FILE_LIMIT + " files were processed.\n";
    if (skippedFiles.length > 0) {
        report += "\n\nSkipped (" + skippedFiles.length + "):\n" + skippedFiles.join("\n");
    }
    showAlertDialog('Import Success', report);
    return "OK: " + report;
}

imp_bat();


