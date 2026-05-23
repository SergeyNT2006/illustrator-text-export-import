#target illustrator
var DEMO_FRAME_LIMIT = 5;

function imp_xml() {
    if (app.documents.length === 0) {
        showAlertDialog('Import Error', "No open documents. Open the document and try again.");
        return "ERROR: No open documents. Open the document and try again.";
    }

    var doc = app.activeDocument;
    var xmlFile = File.openDialog("Select an translated XML file", "*.xml");
    if (xmlFile) {
                xmlFile.encoding = "UTF-8";
                xmlFile.open("r");
                var xmlContent = xmlFile.read();
                var xmlDoc = new XML(xmlContent);

                for (var i = 0; i < xmlDoc.CharacterStyles.s.length(); i++) 
                {
                    var styleNode = xmlDoc.CharacterStyles.s[i];
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

                var framesWithErrors = [];
                var maxImportFrames = Math.min(DEMO_FRAME_LIMIT, xmlDoc.frame.length(), doc.textFrames.length);
                for (var f = 0; f < maxImportFrames; f++)
                {
                    var textElement = xmlDoc.frame[f].text.toString();
                    var linesInCdata = textElement.split('\n').length;
                    var paragraphsCount = xmlDoc.frame[f].paragraph.length();
                    if (linesInCdata !== paragraphsCount)
                    {
                        framesWithErrors.push(f);
                    }
                }
                if (framesWithErrors.length > 0) {
                    var errMsg = "Formatting error in XML file.\nCheck <frame id=\"N\"> where N is: " + framesWithErrors.join(', ') + "\nThe number of lines in <CDATA> must equal the number of <paragraph> tags.";
                    showAlertDialog('Import Error', errMsg);
                    return "ERROR: " + errMsg;
                }

                var textFramesLen = maxImportFrames;
                for (var i = 0; i < textFramesLen; i++)
                {
                    var text = xmlDoc.frame[i].text.toString();
                    doc.textFrames[i].contents = text;

                    for (var j = 0; j < doc.textFrames[i].paragraphs.length; j++)
                    {
                        var parcur = doc.textFrames[i].paragraphs[j];
                        var values = xmlDoc.frame[i].paragraph[j].toString().split(',');
                        var position = values[0];
                        switch (position)
                        {
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
                            }
                            parcur.characterAttributes.size = fontSize;
                            parcur.characterAttributes.fillColor = fontColor;
                        } catch (e) {
                            showAlertDialog('Import Error', "Error assigning paragraph attributes (frame " + i + ", paragraph " + j + "): " + e);
                        }
                    }
                }  
                redraw();
                for (var i = 0; i < textFramesLen; i++)
                {
                    for (var j = 0; j < doc.textFrames[i].paragraphs.length; j++)
                    {
                        if (/^\s+$/.test(doc.textFrames[i].paragraphs[j].contents))
                        {
                            doc.textFrames[i].paragraphs[j].contents = "";
                        }
                    }
                }
                redraw();
                var report = "File " + xmlFile.name + " imported successfully.";
                report += "\nDEMO MODE: only first " + DEMO_FRAME_LIMIT + " text frames were imported.";
                showAlertDialog('Import Success', report);
                return "OK: " + report;
    } else {
        return "CANCEL";
    }
}

imp_xml();


