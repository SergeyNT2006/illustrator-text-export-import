#target illustrator
// Shared utilities: curver, escapeXML, font helpers, color helpers, paragraph helpers, BCP47 language list
#include "_shared.jsx"
var DEMO_FRAME_LIMIT = 5;

function mapLanguagesByTag(languages) {
    var map = {};
    for (var i = 0; i < languages.length; i++) {
        map[languages[i].tag] = languages[i].label;
    }
    return map;
}

function saveFavoriteLanguages(selectedSourceTag, selectedTargetTag, fullLanguageMap) {
    var favoriteFile = new File(getHelpFolderPath() + "bcp47_languages_favorite.txt");
    var currentFavorites = {};
    var existing = loadBcp47FavoriteLanguageList();
    for (var i = 0; i < existing.length; i++) {
        currentFavorites[existing[i].tag] = existing[i].label;
    }

    if (fullLanguageMap[selectedSourceTag]) {
        currentFavorites[selectedSourceTag] = fullLanguageMap[selectedSourceTag];
    }
    if (fullLanguageMap[selectedTargetTag]) {
        currentFavorites[selectedTargetTag] = fullLanguageMap[selectedTargetTag];
    }

    var lines = [];
    lines.push("// Favorite language list for XLIFF export");
    lines.push("// Format: tag|label");
    lines.push("// Lines starting with // are ignored");
    lines.push("");

    var favList = languageMapToList(currentFavorites);
    for (var j = 0; j < favList.length; j++) {
        lines.push(favList[j].tag + "|" + favList[j].label);
    }

    if (!favoriteFile.open("w")) {
        showAlertDialog("XLIFF Warning", "Unable to save favorite language list:\n" + favoriteFile.fsName);
        return;
    }
    favoriteFile.encoding = "UTF8";
    favoriteFile.write(lines.join("\n"));
    favoriteFile.close();
}

function getLanguagePairFromDialog(allLanguages, favoriteLanguages, defaultSource, defaultTarget) {
    var w = new Window("dialog", "XLIFF language pair");
    w.orientation = "column";
    w.alignChildren = "fill";
    w.spacing = 8;
    w.margins = 14;

    var intro = w.add("statictext", undefined, "Select source and target language (BCP47)");
    intro.alignment = "left";

    var modeGroup = w.add("group");
    modeGroup.orientation = "row";
    modeGroup.alignChildren = ["left", "center"];
    modeGroup.alignment = "fill";

    var favoriteCheckbox = modeGroup.add("checkbox", undefined, "Use Favorite list of languages");
    favoriteCheckbox.value = false;

    var sourcePanel = w.add("panel", undefined, "Source language");
    sourcePanel.orientation = "column";
    sourcePanel.alignChildren = "fill";
    sourcePanel.margins = 10;
    var sourceGroup = sourcePanel.add("group");
    sourceGroup.orientation = "row";
    var sourceList = sourceGroup.add("dropdownlist", undefined, []);
    sourceList.minimumSize.width = 320;

    var targetPanel = w.add("panel", undefined, "Target language");
    targetPanel.orientation = "column";
    targetPanel.alignChildren = "fill";
    targetPanel.margins = 10;
    var targetGroup = targetPanel.add("group");
    targetGroup.orientation = "row";
    var targetList = targetGroup.add("dropdownlist", undefined, []);
    targetList.minimumSize.width = 320;

    var validationText = w.add("statictext", undefined, "");
    validationText.alignment = "left";
    validationText.visible = false;

    var currentList = allLanguages;

    function refillDropdown(dropdown, listToUse, preferredTag, defaultIndexFallback) {
        dropdown.removeAll();
        var preferredIndex = -1;
        for (var i = 0; i < listToUse.length; i++) {
            var itemText = listToUse[i].tag + " | " + listToUse[i].label;
            dropdown.add("item", itemText);
            if (listToUse[i].tag === preferredTag) {
                preferredIndex = i;
            }
        }
        if (preferredIndex === -1) preferredIndex = defaultIndexFallback;
        dropdown.selection = preferredIndex;
    }

    function getSelectedTag(dropdown, listToUse, fallbackTag) {
        if (!listToUse || listToUse.length === 0) {
            return fallbackTag;
        }
        var idx = dropdown.selection ? dropdown.selection.index : 0;
        if (idx < 0 || idx >= listToUse.length) idx = 0;
        return listToUse[idx].tag;
    }

    function fillDropdowns(useFavorites) {
        currentList = useFavorites && favoriteLanguages.length > 0 ? favoriteLanguages : allLanguages;
        refillDropdown(sourceList, currentList, defaultSource, 0);
        refillDropdown(targetList, currentList, defaultTarget, Math.min(1, currentList.length - 1));
    }

    fillDropdowns(false);

    function updateValidationState() {
        var sourceTag = getSelectedTag(sourceList, currentList, defaultSource);
        var targetTag = getSelectedTag(targetList, currentList, defaultTarget);
        var samePair = sourceTag === targetTag;

        okBtn.enabled = !samePair;
        validationText.visible = samePair;
        if (samePair) {
            validationText.text = "Source and target must be different.";
        } else {
            validationText.text = "";
        }
    }

    favoriteCheckbox.onClick = function () {
        if (favoriteCheckbox.value && favoriteLanguages.length === 0) {
            showAlertDialog("XLIFF Warning", "Favorite list is empty. Add at least one pair via normal mode first.");
            favoriteCheckbox.value = false;
        }
        fillDropdowns(favoriteCheckbox.value);
        updateValidationState();
    };

    var buttons = w.add("group");
    buttons.orientation = "row";
    buttons.alignment = "right";
    var helpBtn = buttons.add("button", undefined, "Help");
    var cancelBtn = buttons.add("button", undefined, "Cancel", { name: "cancel" });
    var okBtn = buttons.add("button", undefined, "OK", { name: "ok" });

    sourceList.onChange = updateValidationState;
    targetList.onChange = updateValidationState;
    updateValidationState();

    helpBtn.onClick = function() {
        showAlertDialog(
            "XLIFF Language Help",
            "Language list files (in assets/help/):\n" +
            "- bcp47_languages.txt\n" +
            "- bcp47_languages_favorite.txt\n\n" +
            "Format per line:\n" +
            "tag|label\n" +
            "Example:\n" +
            "en|English (en)\n" +
            "de|German (de)\n\n" +
            "Rules:\n" +
            "- Empty lines are ignored\n" +
            "- Lines starting with // are ignored\n" +
            "- Invalid lines are skipped\n" +
            "- Favorite mode uses only entries from favorite file\n" +
            "- Favorite list is automatically updated from successful selections\n" +
            "- On Cancel, default pair en-de is used"
        );
    };

    cancelBtn.onClick = function() {
        w.close(0);
    };

    okBtn.onClick = function() {
        var selectedSource = getSelectedTag(sourceList, currentList, defaultSource);
        var selectedTarget = getSelectedTag(targetList, currentList, defaultTarget);
        if (selectedSource === selectedTarget) {
            showAlertDialog("XLIFF Warning", "Source and target languages must be different.");
            return;
        }
        w.close(1);
    };

    var result = w.show();
    if (result !== 1) {
        return { source: defaultSource, target: defaultTarget, wasCanceled: true };
    }

    var sourceTag = getSelectedTag(sourceList, currentList, defaultSource);
    var targetTag = getSelectedTag(targetList, currentList, defaultTarget);
    return { source: sourceTag, target: targetTag, wasCanceled: false };
}

function exp_xliff() {
    if (app.documents.length === 0) {
        return "ERROR: No open documents. Please open the required document and try again.";
    }
    var doc = app.activeDocument;
    var exportWarnings = [];
    var textFrames = doc.textFrames;

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

    var docpath = app.activeDocument.path;
    var docname = app.activeDocument.name;

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

    var defaultSourceLang = "en";
    var defaultTargetLang = "de";
    var allLanguages = loadBcp47LanguageList();
    var favoriteLanguages = loadBcp47FavoriteLanguageList();
    var langPair = getLanguagePairFromDialog(allLanguages, favoriteLanguages, defaultSourceLang, defaultTargetLang);
    if (langPair.source === langPair.target) {
        showAlertDialog("XLIFF Warning", "Source and target languages must be different.\nUsing default pair en-de.");
        langPair.source = defaultSourceLang;
        langPair.target = defaultTargetLang;
    }
    if (!langPair.wasCanceled) {
        var fullLanguageMap = mapLanguagesByTag(allLanguages);
        saveFavoriteLanguages(langPair.source, langPair.target, fullLanguageMap);
    }

    var TmpFile = new File(docpath + '/' + docname + '_to_translate.xliff');
    var yourFile = TmpFile.saveDlg('Save as', '*.xliff');
    var file = yourFile;
    if (!file) {
        for (var k = 0; k < lockedLayers.length; k++) {
            doc.layers.getByName(lockedLayers[k]).locked = true;
        }
        return "CANCEL";
    }
    file.open("w");
    file.encoding = "UTF8";
    var xliffHeaderAndInfo = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<xliff version="1.2">',
        '<file source-language="' + escapeXML(langPair.source) + '" target-language="' + escapeXML(langPair.target) + '" datatype="plaintext" original="' + escapeXML(docname) + '">',
        '<header>',
        '<about>' + escapeXML(buildAboutText('sinozemez@gmail.com. or ryzl@hotmail.com')) + '</about>',
        '<license>' + escapeXML('Licensed for use by "Organization". Email. Contact.') + '</license>',
        '<filename>' + escapeXML(docname) + '</filename>',
        '<totalsymbols> with space = ' + qtext + '  / without space = ' + qwtext + '</totalsymbols>'
    ];
    file.writeln(xliffHeaderAndInfo.join("\n"));
    file.writeln('<CharacterStyles>');
    var uniqueCharacterStyles = {};
    var currentCharacterStyleId = 0;
    for (var i = 0; i < demoFrameCount; i++) {
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
    file.writeln('</header>');
    file.writeln('<body>');
    for (var i = 0; i < demoFrameCount; i++) {
        var text = textFrames[i].contents;
        file.writeln('  <trans-unit id="frame_' + i + '">');
        file.writeln('    <source>' + escapeXML(text) + '</source>');
        file.writeln('    <target></target>');
        var paragraphs = textFrames[i].paragraphs;
        for (var j = 0; j < paragraphs.length; j++) {
            try {
                var paragraph = paragraphs[j];
                if (paragraph.contents == "") {
                    paragraph.contents = " ";
                }
                var dominantCharIndex = getDominantStyleIndex(paragraph);
                if (dominantCharIndex < 0 || dominantCharIndex >= paragraph.characters.length) {
                    exportWarnings.push("Paragraph: frame " + i + ", paragraph " + j + " skipped (no dominant char)");
                    continue;
                }
                var dominantChar = paragraph.characters[dominantCharIndex];
                var colorString = getColorStringFromFill(dominantChar.characterAttributes.fillColor, "0,0,0,100");
                var firstChar = dominantChar;
                var position = paragraph.justification;
                var indentBefore = paragraph.spaceBefore;
                var indentAfter = paragraph.paragraphAttributes.spaceAfter;
                var leftindent = paragraph.leftIndent;
                var fline = paragraph.paragraphAttributes.firstLineIndent;
                var rightindent = paragraph.rightIndent;
                var tabpos = 0;
                if (paragraph.tabStops.length > 0) {
                    var firstTabStop = paragraph.tabStops[0];
                    var tabPosition = firstTabStop.position;
                    tabpos = tabPosition;
                }
                var firstCharFontInfo = getSafeFontInfo(firstChar.characterAttributes);
                var fontFamily = firstCharFontInfo.family.replace(/\s/g, "");
                var fontStyle = firstCharFontInfo.style;
                var fontInternalName = firstCharFontInfo.internalName;
                var size = Math.round(firstChar.characterAttributes.size);
                var font = fontFamily + "-" + fontStyle;
                var paragraphString = position + "," + indentBefore + "," + indentAfter + "," + leftindent + "," + fline + "," + rightindent + "," + tabpos + "," + font + "," + fontInternalName + "," + size + "," + colorString;
                file.writeln("    <paragraph id=\"" + j + "\">" + escapeXML(paragraphString) + "</paragraph>");
            } catch (e) {
                exportWarnings.push("Paragraph: frame " + i + ", paragraph " + j + " skipped (" + e + ")");
            }
        }
        file.writeln('  </trans-unit>');
    }
    file.writeln('</body>');
    file.writeln('</file>');
    file.writeln('</xliff>');
    file.close();
    for (var k = 0; k < lockedLayers.length; k++) {
        var layerToLock = doc.layers.getByName(lockedLayers[k]);
        layerToLock.locked = true;
    }
    redraw();
    var report = "XLIFF export complete!";
    report += "\nDEMO MODE: only first " + DEMO_FRAME_LIMIT + " text frames were exported.";
    if (exportWarnings.length > 0) {
        report += "\n\n====================================";
        report += "\nSkipped problematic nodes: " + exportWarnings.length;
    }
    showAlertDialog('Export Success', report);
    return "OK: " + report;
}

exp_xliff();


