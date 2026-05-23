#target illustrator
// Shared utilities: curver, escapeXML, font helpers, color helpers, paragraph helpers
#include "_shared.jsx"
var DEMO_FILE_LIMIT = 5;


function find_files(dir, mask_array)
{
    var arr = [];
    for (var i = 0; i < mask_array.length; i++)
    {
        arr = arr.concat(find_files_sub(dir, [], mask_array[i].toUpperCase()));
    }
    return arr;
}

function find_files_sub(dir, array, mask)
{
    var f = Folder(dir).getFiles('*.*');
    for (var i = 0; i < f.length; i++)
    {
        if (f[i] instanceof Folder)
        {
            find_files_sub(f[i], array, mask);
        }
        else if (f[i].name.substr(-mask.length).toUpperCase() == mask)
        {
            array.push(f[i]);
        }
    }
    return array;
}


function exp_bat()
{
    function selfiletype()
    {
        var w = new Window("dialog", "Select File Type");
        w.alignChildren = "left";
        var formats = [];
        formats[0] = w.add("radiobutton", undefined, "Ai");
        formats[1] = w.add("radiobutton", undefined, "EPS");
        formats[2] = w.add("radiobutton", undefined, "SVG");
        formats[0].value = true;
        var selectedIndex = 0;
        var okBtn = w.add("button", undefined, "OK");
        okBtn.onClick = function () {
            for (var i = 0; i < formats.length; i++) {
                if (formats[i].value) { selectedIndex = i; break; }
            }
            w.close(1);
        };
        if (w.show() !== 1) {
            return null;
        }
        return [".ai", ".eps", ".svg"][selectedIndex];
    }

    var extension = selfiletype();
    if (!extension) {
        return "CANCEL";
    }

    if (app.documents.length > 0)
    {
        var folder = Folder(app.activeDocument.path).selectDlg("Select the folder with the Illustration files");
    }
    else
    {
        var folder = Folder.selectDialog("Select Source Folder...\nHint: Open a document to set default path");
    }

    if (folder == null) {
        return "CANCEL";
    }

    var TmpFile = new File(folder.fsName + "/" + folder.name + "_to_translate.xml");
    yourFile = TmpFile.saveDlg('Save as', '*.xml');
    var myFilename = yourFile;
    if (!myFilename) {
        return "CANCEL";
    }

    var files = find_files(folder, [extension]);
    var totalFoundFiles = files.length;
    if (totalFoundFiles === 0) {
        return "ERROR: No *" + extension + " files found in the selected folder.";
    }
    var fileCount = Math.min(totalFoundFiles, DEMO_FILE_LIMIT);

    var confirmWin = new Window("dialog", "Batch Export");
    confirmWin.orientation = "column";
    confirmWin.alignChildren = ["fill", "center"];
    confirmWin.spacing = 10;
    confirmWin.margins = 16;
    confirmWin.add("statictext", undefined, "Please wait for the work to complete.");
    confirmWin.add("statictext", undefined, "The export will start only after you click OK.");
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

    var FileOut = new File(myFilename);
    FileOut.open("w");
    FileOut.encoding = "UTF8";
    FileOut.writeln('<?xml version="1.0" encoding="UTF-8"?>');
    FileOut.writeln("<root>");
    FileOut.writeln('<about>' + escapeXML(buildAboutText('ryzl@hotmail.com')) + '</about>');
    FileOut.writeln("<folder>" + escapeXML(folder.fsName) + "</folder>");
    FileOut.writeln("<extension>" + extension + "</extension>");

    var startTime = new Date();
    var processedCount = 0;
    var skippedFiles = [];
    var totalFrames = 0;

    for (var j = 0; j < fileCount; j++)
    {
        var idoc = null;
        var fullPathString = "";
        var shortFileName = files[j].name;

        try
        {
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
            idoc = app.open(files[j]);
            fullPathString = decodeURI(idoc.fullName.fsName || idoc.fullName.toString());
            app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;

            var fileLines = [];
            fileLines.push("<file Name=\"" + escapeXML(fullPathString) + "\">");

            var uniqueCharacterStyles = {};
            var currentCharacterStyleId = 0;
            fileLines.push('\t<CharacterStyles>');
            for (var charFrameIndex = 0; charFrameIndex < idoc.textFrames.length; charFrameIndex++) {
                var textFrame = idoc.textFrames[charFrameIndex];
                for (var charRangeIndex = 0; charRangeIndex < textFrame.textRanges.length; charRangeIndex++) {
                    try {
                        var textRange = textFrame.textRanges[charRangeIndex];
                        var characterAttributes = textRange.characterAttributes;
                        var fontInfo = getSafeFontInfo(characterAttributes);
                        var fontFamily = fontInfo.family;
                        var fontStyle = fontInfo.style;
                        var fontInternalName = fontInfo.internalName;
                        var fontSize = Math.round(characterAttributes.size);
                        var cmykString = getColorStringFromFill(characterAttributes.fillColor, "0,0,0,100");
                        var styleKey = fontFamily + "|" + fontStyle + "|" + fontSize + "|" + cmykString;
                        if (!(styleKey in uniqueCharacterStyles)) {
                            currentCharacterStyleId++;
                            uniqueCharacterStyles[styleKey] = currentCharacterStyleId;
                            fileLines.push('\t\t<s id="' + currentCharacterStyleId + '">' + escapeXML(fontFamily.replace(/\s/g, "")) + ',' + escapeXML(fontStyle) + ',' + escapeXML(fontInternalName) + ',' + fontSize + ',' + cmykString + '</s>');
                        }
                    } catch (e) {}
                }
            }
            fileLines.push('\t</CharacterStyles>');

            var lockedLayers = [];
            for (var l = 0; l < idoc.layers.length; l++) {
                var layer = idoc.layers[l];
                if (layer.locked) lockedLayers.push(layer.name);
            }
            if (lockedLayers.length > 0) {
                for (var u = 0; u < idoc.layers.length; u++) {
                    idoc.layers[u].locked = false;
                }
            }

            for (var o = idoc.textFrames.length - 1; o >= 0; o--) {
                var frame = idoc.textFrames[o];
                if (!frame.contents || /^\s*$/.test(frame.contents)) frame.remove();
            }

            for (var i = 0; i < idoc.textFrames.length; i++) {
                var frame = idoc.textFrames[i];
                var content = frame.contents;
                var lastNonWhitespaceIndex = content.search(/\S(?=\s*$)/);
                var lastSoftBreakIndex = content.search(/\S(?=\x03*$)/);
                if (lastNonWhitespaceIndex !== -1) {
                    var startIndex = lastNonWhitespaceIndex + 1;
                    var fullTextRange = frame.textRanges[0];
                    fullTextRange.start = startIndex;
                    fullTextRange.end = content.length;
                    fullTextRange.remove();
                }
                if (lastSoftBreakIndex !== -1) {
                    var startIndex2 = lastSoftBreakIndex + 1;
                    var fullTextRange2 = frame.textRanges[0];
                    fullTextRange2.start = startIndex2;
                    fullTextRange2.end = content.length;
                    fullTextRange2.remove();
                }
            }

            var idocFrameLen = idoc.textFrames.length;
            totalFrames += idocFrameLen;
            for (var f = 0; f < idocFrameLen; f++) {
                var frame2 = idoc.textFrames[f];
                fileLines.push("\t<frame id=\"" + f + "\">");
                fileLines.push('\t\t<text><![CDATA[' + frame2.contents.replace(/\u0003/g, '\r') + ']]></text>');
                fileLines.push("\t</frame>");
            }
            fileLines.push("</file>");

            for (var k = 0; k < lockedLayers.length; k++) {
                var layerToLock = idoc.layers.getByName(lockedLayers[k]);
                layerToLock.locked = true;
            }

            idoc.close(SaveOptions.SAVECHANGES);
            idoc = null;

            for (var ln = 0; ln < fileLines.length; ln++) {
                FileOut.writeln(fileLines[ln]);
            }
            processedCount++;
        }
        catch (e)
        {
            if (idoc) {
                try {
                    idoc.close(SaveOptions.DONOTSAVECHANGES);
                } catch (closeErr) {}
            }
            skippedFiles.push(shortFileName);
        }
        $.gc();
    }

    FileOut.writeln("<totalfiles>Processed " + processedCount + " \"*" + extension + "\" files</totalfiles>");
    FileOut.write("</root>");
    FileOut.close();

    var endTime = new Date();
    var elapsedSec = Math.round((endTime - startTime) / 1000);
    var elapsedStr = (elapsedSec < 60) ? elapsedSec + " sec" : Math.floor(elapsedSec / 60) + " min " + (elapsedSec % 60) + " sec";

    var report = "Batch Export - complete\n\n";
    report += "Processed files: " + processedCount + "\n";
    report += "Found files: " + totalFoundFiles + "\n";
    report += "Total text frames: " + totalFrames + "\n";
    report += "Time elapsed: " + elapsedStr + "\n";
    report += "DEMO MODE: only first " + DEMO_FILE_LIMIT + " files were processed.\n";
    if (skippedFiles.length > 0) {
        report += "\n\nSkipped (" + skippedFiles.length + "):\n" + skippedFiles.join("\n");
    }
    showAlertDialog('Export Success', report);
    return "OK: " + report;
}

exp_bat();


