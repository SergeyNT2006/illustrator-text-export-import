#target illustrator
var DEMO_FRAME_LIMIT = 5;

function imp_xliff() {
    if (app.documents.length === 0) {
        return "ERROR: No open documents. Open the document and try again.";
    } else {
        var fontIssues = [];
        var paragraphErrors = [];
        var doc = app.activeDocument;
        var xliffFile = File.openDialog("Select an translated XLIFF file", "*.xliff");
        if (xliffFile) {
            xliffFile.encoding = "UTF-8";
            xliffFile.open("r");
            var xliffContent = xliffFile.read();
            var xliff = new XML(xliffContent);
            if (xliff.file.header.CharacterStyles.s.length() > 0) {
                for (var i = 0; i < xliff.file.header.CharacterStyles.s.length(); i++) {
                    var styleNode = xliff.file.header.CharacterStyles.s[i];
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
                    var fullFontName = fontFamily + "-" + fontStyle;
                    var styleName = styleId + "_" + fullFontName + "_" + fontSize + "pt_" + "CMYK-" + fullCMYK;
                    var charStyle;
                    try {
                        charStyle = doc.characterStyles.getByName(styleName);
                    } catch (e) {
                        charStyle = doc.characterStyles.add(styleName);
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
                            if (fontInternalName && foundFont.name !== fontInternalName) {
                                fontIssues.push(
                                    "Style id=" + styleId +
                                    " | requested internal: " + fontInternalName +
                                    " | assigned: " + foundFont.name
                                );
                            }
                        } else {
                            fontIssues.push(
                                "Style id=" + styleId +
                                " | requested: " + fontFamily + "-" + fontStyle +
                                " | action: font not found (style kept without font assignment)"
                            );
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
            }
            var transUnits = xliff.file.body[0].children();
            var transUnitsCount = transUnits.length();
            var docFramesCount = doc.textFrames.length;
            var maxImportFrames = Math.min(DEMO_FRAME_LIMIT, transUnitsCount, docFramesCount);
            var framesWithErrors = [];
            for (var f = 0; f < maxImportFrames; f++) {
                var transUnit = transUnits[f];
                var targetText = transUnit.target.toString();
                if (targetText.replace(/\s/g, '').length === 0) 
                {
                    continue;
                }
                var linesInTarget = targetText.split('\n').length;
                var paragraphsCount = transUnit.paragraph.length();
                if (linesInTarget !== paragraphsCount) {
                    framesWithErrors.push(f);
                }
            }
            if (framesWithErrors.length > 0) {
                return "ERROR: Formatting error in XLIFF file.\nCheck <trans-unit id='frame_N'> where N is: " + framesWithErrors.join(', ') + "\nThe number of lines in <target> must equal the number of <paragraph> tags.";
            }
            for (var i = 0; i < maxImportFrames; i++) {
                var transUnit = transUnits[i];
                var targetText = transUnit.target.toString();
                if (targetText.replace(/\s/g, '').length === 0) {
                    continue;
                }
                doc.textFrames[i].contents = targetText;
                for (var j = 0; j < doc.textFrames[i].paragraphs.length; j++) {
                    var parcur = doc.textFrames[i].paragraphs[j];
                    var values = transUnit.paragraph[j].toString().split(',');
                    var position = values[0];
                    switch (position) {
                        case "Justification.LEFT":
                            position = Justification.LEFT;
                            break;
                        case "Justification.CENTER":
                            position = Justification.CENTER;
                            break;
                        case "Justification.RIGHT":
                            position = Justification.RIGHT;
                            break;
                        default:
                            position = Justification.LEFT;
                            break;
                    }
                    var IBEF = parseInt(values[1], 10);
                    var IAF = parseInt(values[2], 10);
                    var LeftIndent = parseInt(values[3], 10);
                    var FirstLineLeftIndent = parseInt(values[4], 10);
                    var RightIndent = parseInt(values[5], 10);
                    var tabpos = parseInt(values[6], 10);
                    var fontName = values[7];
                    var paragraphFontInternalName = values[8];
                    var fontSize = parseFloat(values[9]);
                    var fontColor = new CMYKColor();
                    fontColor.cyan = parseInt(values[10], 10);
                    fontColor.magenta = parseInt(values[11], 10);
                    fontColor.yellow = parseInt(values[12], 10);
                    fontColor.black = parseInt(values[13], 10);
                    parcur.paragraphAttributes.justification = position;
                    parcur.paragraphAttributes.spaceBefore = parseInt(IBEF, 10);
                    parcur.paragraphAttributes.spaceAfter = parseInt(IAF, 10);
                    parcur.paragraphAttributes.firstLineIndent = parseInt(FirstLineLeftIndent, 10);
                    parcur.leftIndent = parseInt(LeftIndent, 10);
                    parcur.rightIndent = parseInt(RightIndent, 10);
                    var t = new Array();
                    t[0] = new TabStopInfo;
                    t[0].position = tabpos;
                    parcur.tabStops = t;
                    try {
                        var fontNameVariants = [
                            paragraphFontInternalName,
                            fontName,
                            fontName.replace('-', ''),
                            fontName.replace('-', ' '),
                            fontName.split('-')[0]
                        ];
                        var foundFont = null;
                        for (var v = 0; v < fontNameVariants.length; v++) {
                            try {
                                foundFont = app.textFonts.getByName(fontNameVariants[v]);
                                if (foundFont) break;
                            } catch (e) {}
                        }
                        if (foundFont) {
                            parcur.characterAttributes.textFont = foundFont;
                            if (paragraphFontInternalName && foundFont.name !== paragraphFontInternalName) {
                                fontIssues.push(
                                    "Frame " + i + ", paragraph " + j +
                                    " | requested internal: " + paragraphFontInternalName +
                                    " | assigned: " + foundFont.name
                                );
                            } else if (!paragraphFontInternalName && foundFont.name !== fontName) {
                                fontIssues.push(
                                    "Frame " + i + ", paragraph " + j +
                                    " | requested: " + fontName +
                                    " | assigned: " + foundFont.name
                                );
                            }
                        } else {
                            fontIssues.push(
                                "Frame " + i + ", paragraph " + j +
                                " | requested: " + fontName +
                                " | action: font not found (paragraph font unchanged)"
                            );
                        }
                        parcur.characterAttributes.size = fontSize;
                        parcur.characterAttributes.fillColor = fontColor;
                    } catch (e) {
                        paragraphErrors.push(
                            "Frame " + i + ", paragraph " + j +
                            " | error: " + e
                        );
                    }
                }
            }
            redraw();
            for (var i = 0; i < maxImportFrames; i++) {
                for (var j = 0; j < doc.textFrames[i].paragraphs.length; j++) {
                    if (/^\s+$/.test(doc.textFrames[i].paragraphs[j].contents)) {
                        doc.textFrames[i].paragraphs[j].contents = "";
                    }
                }
            }
            redraw();
            var report = "XLIFF import complete";
            report += "\nDEMO MODE: only first " + DEMO_FRAME_LIMIT + " text frames were imported.";
            if (fontIssues.length > 0 || paragraphErrors.length > 0) {
                report += "\n\n====================================";
                report += "\nFont/style assignment notes:";
                report += "\n====================================";
                if (fontIssues.length > 0) {
                    for (var fi = 0; fi < fontIssues.length; fi++) {
                        report += "\n- " + fontIssues[fi];
                    }
                } else {
                    report += "\n- No font assignment issues";
                }
                if (paragraphErrors.length > 0) {
                    report += "\n\n====================================";
                    report += "\nParagraph attribute errors:";
                    report += "\n====================================";
                    for (var pe = 0; pe < paragraphErrors.length; pe++) {
                        report += "\n- " + paragraphErrors[pe];
                    }
                }
            }
            showAlertDialog('Import Success', report);
            return "OK: " + report;
        } else {
            return "CANCEL";
        }
    }
}

imp_xliff();


