#target illustrator
// Shared utilities: curver, escapeXML, font helpers, color helpers, paragraph helpers
#include "_shared.jsx"
var DEMO_FRAME_LIMIT = 5;

function exp_xml() {
    if (app.documents.length === 0) {
        return "ERROR: No open documents. Please open the required document and try again.";
    }

    var doc = app.activeDocument;
    var textFrames = doc.textFrames;
    var exportWarnings = [];

    var lockedLayers = [];
    for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.locked) {
            lockedLayers.push(layer.name);
        }
    }
    if (lockedLayers.length > 0) {
        for (var j = 0; j < doc.layers.length; j++) {
            doc.layers[j].locked = false;
        }
    }

    // Do NOT convert document color space — it alters fill colors and causes export/import mismatch.
    // RGB colors are converted to CMYK string in getColorStringFromFill when writing to file.

    for (var i = textFrames.length - 1; i >= 0; i--) {
        var frame = textFrames[i];
        if (!frame.contents || /^\s*$/.test(frame.contents)) {
            frame.remove();
        }
    }

    var demoFrameCount = Math.min(textFrames.length, DEMO_FRAME_LIMIT);

    for (var i = 0; i < demoFrameCount; i++) {
        var frame = textFrames[i];
        var content = frame.contents;
        var lastNonWhitespaceIndex = content.search(/\S(?=\s*$)/);
        var lastSoftBreakIndex = content.search(/\S(?=\x03*$)/);

        if (lastNonWhitespaceIndex !== -1) {
            var startIndex = lastNonWhitespaceIndex + 1;
            var endIndex = content.length;
            var fullTextRange = frame.textRanges[0];
            fullTextRange.start = startIndex;
            fullTextRange.end = endIndex;
            fullTextRange.remove();
        }
        if (lastSoftBreakIndex !== -1) {
            var startIndex = lastSoftBreakIndex + 1;
            var endIndex = content.length;
            var fullTextRange = frame.textRanges[0];
            fullTextRange.start = startIndex;
            fullTextRange.end = endIndex;
            fullTextRange.remove();
        }
    }

    var qtext = 0;
    var qwtext = 0;
    for (var i = 0; i < demoFrameCount; i++) {
        var textRange = textFrames[i].textRange;
        qtext += textRange.contents.length;
    }
    for (var i = 0; i < demoFrameCount; i++) {
        var textRange = textFrames[i].textRange;
        for (var j = 0; j < textRange.contents.length; j++) {
            if (textRange.contents[j] !== " ") {
                qwtext++;
            }
        }
    }

    var docpath = app.activeDocument.path;
    var docname = app.activeDocument.name;
    var TmpFile = new File(docpath + '/' + docname + '_to_translate.xml');
    yourFile = TmpFile.saveDlg('Save as', '*.xml');
    var file = yourFile;
    if (file == null) {
        for (var k = 0; k < lockedLayers.length; k++) {
            var layerToLock = doc.layers.getByName(lockedLayers[k]);
            layerToLock.locked = true;
        }
        return "CANCEL";
    }

    file.open("w");
    file.encoding = "UTF8";

    var xmlHeaderAndInfo = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<document>',
        '<about>' + escapeXML(buildAboutText('sinozemez@gmail.com. or ryzl@hotmail.com')) + '</about>',
        '<license>' + escapeXML('Licensed for use by "Organization". Email. Contact.') + '</license>',
        '<filename>' + escapeXML(docname) + '</filename>',
        '<totalsymbols> with space = ' + qtext + '  / without space = ' + qwtext + '</totalsymbols>'
    ];
    file.writeln(xmlHeaderAndInfo.join("\n"));

    file.writeln('<CharacterStyles>');
    var uniqueCharacterStyles = {};
    var currentCharacterStyleId = 0;

    var textFrameLen = demoFrameCount;
    for (var i = 0; i < textFrameLen; i++) {
        var textFrame = doc.textFrames[i];
        for (var j = 0; j < textFrame.textRanges.length; j++) {
            try {
                var textRange = textFrame.textRanges[j];
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
                    file.writeln('\t<s id="' + currentCharacterStyleId + '">' + escapeXML(fontFamily.replace(/\s/g, "")) + ',' + escapeXML(fontStyle) + ',' + escapeXML(fontInternalName) + ',' + fontSize + ',' + cmykString + '</s>');
                }
            } catch (e) {
                exportWarnings.push("CharacterStyles: frame " + i + ", textRange " + j + " skipped (" + e + ")");
            }
        }
    }
    file.writeln('</CharacterStyles>');

    var textFrameLen = demoFrameCount;
    for (var i = 0; i < textFrameLen; i++) {
        var textFrame = textFrames[i];
        var paragraphs = textFrame.paragraphs;
        file.writeln('<frame id="' + i + '">');
        file.writeln('\t<text><![CDATA[' + textFrame.contents.replace(/\u0003/g, '\r') + ']]></text>');
        for (var j = 0; j < paragraphs.length; j++) {
            try {
                var paragraph = paragraphs[j];
                if (paragraph.contents == "") {
                    paragraph.contents = " ";
                }
                var dominantCharIndex = getDominantStyleIndex(paragraph);
                if (dominantCharIndex < 0 || dominantCharIndex >= paragraph.characters.length) {
                    exportWarnings.push("Paragraph: frame " + i + ", paragraph " + j + " fallback used (no dominant char)");
                    file.writeln("\t<paragraph id=\"" + j + "\">" + escapeXML(buildFallbackParagraphString()) + "</paragraph>");
                    continue;
                }
                var dominantChar = paragraph.characters[dominantCharIndex];
                var colorString = getColorStringFromFill(dominantChar.characterAttributes.fillColor, "0,0,0,100");
                var position = paragraph.justification;
                var indentBefore = paragraph.spaceBefore;
                var indentAfter = paragraph.paragraphAttributes.spaceAfter;
                var leftindent = paragraph.leftIndent;
                var fline = paragraph.paragraphAttributes.firstLineIndent;
                var rightindent = paragraph.rightIndent;
                if (paragraph.tabStops.length > 0) {
                    var tabpos = paragraph.tabStops[0].position;
                } else {
                    var tabpos = 0;
                }
                var dominantCharFontInfo = getSafeFontInfo(dominantChar.characterAttributes);
                var fontFamily = dominantCharFontInfo.family.replace(/\s/g, "");
                var fontStyle = dominantCharFontInfo.style;
                var fontInternalName = dominantCharFontInfo.internalName;
                var size = Math.round(dominantChar.characterAttributes.size);
                var font = fontFamily + "-" + fontStyle;
                var paragraphString = position + "," + indentBefore + "," + indentAfter + "," + leftindent + "," + fline + "," + rightindent + "," + tabpos + "," + font + "," + fontInternalName + "," + size + "," + colorString;
                file.writeln("\t<paragraph id=\"" + j + "\">" + escapeXML(paragraphString) + "</paragraph>");
            } catch (e) {
                exportWarnings.push("Paragraph: frame " + i + ", paragraph " + j + " fallback used (" + e + ")");
                file.writeln("\t<paragraph id=\"" + j + "\">" + escapeXML(buildFallbackParagraphString()) + "</paragraph>");
            }
        }
        file.writeln('</frame>');
    }

    file.writeln('</document>');
    file.close();

    for (var k = 0; k < lockedLayers.length; k++) {
        var layerToLock = doc.layers.getByName(lockedLayers[k]);
        layerToLock.locked = true;
    }
    redraw();

    var report = 'A file\n\n' + (docname) + '_to_translate.xml\n\nIS SAVED SUCCESSFULLY\n===========================\nNote: RGB font colors are converted to CMYK in the export file.\nOther color models are converted to CMYK.';
    report += '\n===========================\nDEMO MODE: only first ' + DEMO_FRAME_LIMIT + ' text frames were exported.';
    if (exportWarnings.length > 0) {
        report += '\n===========================\nProblematic nodes handled with fallback: ' + exportWarnings.length;
    }
    report += '\n==================== ';
    showAlertDialog('Export Success', report);
    return "OK: " + report;
}

exp_xml();