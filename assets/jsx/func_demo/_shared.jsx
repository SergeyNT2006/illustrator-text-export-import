/**
 * _shared.jsx
 * Shared utility library for Illustrator Text Export and Import.
 *
 * Included via #include "_shared.jsx" at the top of each export script.
 * The #include directive resolves relative to the including file, so all
 * export scripts and this file must live in the same folder.
 *
 * Contents:
 *   - curver          : extension version string
 *   - escapeXML       : XML-safe escaping of special characters
 *   - getSafeFontInternalName : safe read of font.name with fallback
 *   - getSafeFontInfo         : safe read of font family/style/internal name
 *   - getColorStringFromFill  : converts any Illustrator fill color to "C,M,Y,K"
 *   - getDominantStyleIndex   : finds the character index of the most-used style in a paragraph
 *   - getFirstValidCharIndex  : finds the first non-whitespace character index in a paragraph
 *   - buildFallbackParagraphString : returns a safe default paragraph descriptor string
 */

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

/** Current extension version. Must match EXTENSION_VERSION in hostscript.jsx. */
var curver = '5.5.0.0';

function buildAboutText(contactText) {
    return 'This xml file was created using Illustrator Text Export and Import. Ver: ' +
           curver +
           '. The author is Sergey Inozemtsev aka \u0421\u0435\u0440\u0433\u0435\u0439 \u0418\u043d\u043e\u0437\u0435\u043c\u0446\u0435\u0432. Email: ' +
           contactText +
           ' 2018-2026';
}

// ---------------------------------------------------------------------------
// XML utilities
// ---------------------------------------------------------------------------

/**
 * Escapes a value so it is safe to embed inside an XML element or attribute.
 *
 * Handles edge cases:
 *   - null / undefined         → returns ""
 *   - numeric 0                → converts to "0" and escapes (0 is a valid value)
 *   - any other type           → converted to String before escaping
 *
 * Escaped characters:  & < > " '
 *
 * @param  {*}      str  Value to escape.
 * @return {string}      XML-safe string.
 */
function escapeXML(str) {
    if (!str && str !== 0) return "";
    str = String(str);
    return str.replace(/&/g,  "&amp;")
              .replace(/</g,  "&lt;")
              .replace(/>/g,  "&gt;")
              .replace(/\"/g, "&quot;")
              .replace(/'/g,  "&apos;");
}

// ---------------------------------------------------------------------------
// Font utilities
// ---------------------------------------------------------------------------

/**
 * Safely reads the internal PostScript name of a TextFont object.
 *
 * Illustrator can throw when accessing font properties on missing or
 * partially-loaded fonts. All access is guarded with try/catch.
 *
 * @param  {TextFont} textFont      The TextFont object to inspect.
 * @param  {string}   fallbackName  Value returned if the name cannot be read.
 * @return {string}                 Internal font name, or fallbackName.
 */
function getSafeFontInternalName(textFont, fallbackName) {
    try {
        if (textFont && textFont.name) {
            return textFont.name;
        }
    } catch (e) {}
    return fallbackName;
}

/**
 * Safely reads font family, style, and internal PostScript name from
 * a CharacterAttributes object.
 *
 * Each property is accessed in its own try/catch, so a failure on one
 * does not prevent the others from being read. If all fail, safe defaults
 * ("UnknownFont", "Regular") are returned so export can continue.
 *
 * @param  {CharacterAttributes} characterAttributes
 * @return {{ family: string, style: string, internalName: string }}
 */
function getSafeFontInfo(characterAttributes) {
    var family       = "UnknownFont";
    var style        = "Regular";
    var internalName = family + "-" + style;

    try {
        var tf = characterAttributes.textFont;

        try { if (tf && tf.family) family = tf.family; } catch (e) {}
        try { if (tf && tf.style)  style  = tf.style;  } catch (e) {}

        // getSafeFontInternalName falls back to "family-style" if .name throws
        internalName = getSafeFontInternalName(tf, family + "-" + style);
    } catch (e) {}

    return { family: family, style: style, internalName: internalName };
}

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

/**
 * Converts any Illustrator fill color to a "C,M,Y,K" string (values 0-100).
 *
 * Supported color models:
 *   CMYKColor  → direct read
 *   RGBColor   → converted to CMYK via standard formula
 *   GrayColor  → mapped to black channel only
 *   SpotColor  → unwrapped to its underlying color and processed recursively
 *   Other      → fallback value returned
 *
 * All access is guarded with a top-level try/catch so a corrupt fill color
 * cannot abort the export.
 *
 * @param  {Color}   fillColor  Illustrator fill color object.
 * @param  {string}  fallback   Value returned when color cannot be determined.
 *                              Defaults to "0,0,0,100" (100% black).
 * @return {string}             Comma-separated "C,M,Y,K" string.
 */
function getColorStringFromFill(fillColor, fallback) {
    var defaultValue = fallback || "0,0,0,100";
    try {
        if (!fillColor) {
            return defaultValue;
        }
        if (fillColor.typename === "CMYKColor") {
            return Math.round(fillColor.cyan)    + "," +
                   Math.round(fillColor.magenta) + "," +
                   Math.round(fillColor.yellow)  + "," +
                   Math.round(fillColor.black);
        }
        if (fillColor.typename === "RGBColor") {
            var r = fillColor.red   / 255;
            var g = fillColor.green / 255;
            var b = fillColor.blue  / 255;
            var k = 1 - Math.max(r, g, b);
            var c = (1 - r - k) / (1 - k) || 0;
            var m = (1 - g - k) / (1 - k) || 0;
            var y = (1 - b - k) / (1 - k) || 0;
            return Math.round(c * 100) + "," +
                   Math.round(m * 100) + "," +
                   Math.round(y * 100) + "," +
                   Math.round(k * 100);
        }
        if (fillColor.typename === "GrayColor") {
            // gray == 100 means white paper (0% ink)
            if (fillColor.gray === 100) return "0,0,0,0";
            return "0,0,0," + Math.round((1 - fillColor.gray / 100) * 100);
        }
        if (fillColor.typename === "SpotColor" && fillColor.spot && fillColor.spot.color) {
            // Unwrap spot to its underlying process color
            return getColorStringFromFill(fillColor.spot.color, defaultValue);
        }
    } catch (e) {}
    return defaultValue;
}

// ---------------------------------------------------------------------------
// Paragraph / character analysis utilities
// ---------------------------------------------------------------------------

/**
 * Finds the character index of the dominant (most-frequently-occurring)
 * typographic style within a paragraph.
 *
 * "Style" is defined as the combination of font family + font style +
 * font size + fill color. The index of the first character with that
 * style is returned, so the caller can read paragraph-level attributes
 * from a representative character.
 *
 * Used by exp_xliff.jsx to determine paragraph descriptors.
 *
 * @param  {Paragraph} paragraph  Illustrator paragraph object.
 * @return {number}               Index of first occurrence of dominant style,
 *                                or -1 if the paragraph has no characters.
 */
function getDominantStyleIndex(paragraph) {
    var styleCounts    = {};
    var styleFirstIndex = {};
    var maxCount        = 0;
    var dominantStyleKey = "";

    for (var i = 0; i < paragraph.characters.length; i++) {
        var charAttr    = paragraph.characters[i].characterAttributes;
        var fontInfo    = getSafeFontInfo(charAttr);
        var colorString = getColorStringFromFill(charAttr.fillColor, "unknown");
        var styleKey    = fontInfo.family + "|" + fontInfo.style + "|" +
                          charAttr.size   + "|" + colorString;

        if (!styleCounts[styleKey]) {
            styleCounts[styleKey]     = 0;
            styleFirstIndex[styleKey] = i;
        }
        styleCounts[styleKey]++;

        if (styleCounts[styleKey] > maxCount) {
            maxCount         = styleCounts[styleKey];
            dominantStyleKey = styleKey;
        }
    }

    if (dominantStyleKey === "" || styleFirstIndex[dominantStyleKey] === undefined) {
        return -1;
    }
    return styleFirstIndex[dominantStyleKey];
}

/**
 * Finds the index of the first non-whitespace character in a paragraph.
 *
 * Whitespace characters skipped: space, carriage return (\r),
 * line feed (\n), horizontal tab (\t).
 *
 * Used by exp_xml.jsx to locate a representative character for reading
 * paragraph attributes (justification, indents, font, color).
 *
 * @param  {Paragraph} paragraph  Illustrator paragraph object.
 * @return {number}               Index of first non-whitespace character,
 *                                0 if all characters are whitespace,
 *                                or -1 on error / empty paragraph.
 */
function getFirstValidCharIndex(paragraph) {
    try {
        if (!paragraph || !paragraph.characters || paragraph.characters.length === 0) {
            return -1;
        }
        for (var i = 0; i < paragraph.characters.length; i++) {
            var ch = paragraph.characters[i].contents;
            if (ch !== " " && ch !== "\r" && ch !== "\n" && ch !== "\t") {
                return i;
            }
        }
        return 0; // all characters are whitespace — use the first one
    } catch (e) {}
    return -1;
}

/**
 * Returns a safe default paragraph descriptor string used as a fallback
 * when a paragraph's attributes cannot be read (e.g. corrupt text frame).
 *
 * The format matches the paragraph descriptor stored in XML/XLIFF:
 *   Justification, spaceBefore, spaceAfter, leftIndent, firstLineIndent,
 *   rightIndent, tabPos, fontFamily-fontStyle, fontInternalName,
 *   fontSize, C, M, Y, K
 *
 * @return {string}  Comma-separated paragraph descriptor with safe defaults.
 */
function buildFallbackParagraphString() {
    return "Justification.LEFT,0,0,0,0,0,0," +
           "UnknownFont-Regular,UnknownFont-Regular," +
           "10,0,0,0,100";
}

// ---------------------------------------------------------------------------
// BCP47 language list utilities (shared by exp_xliff.jsx and imp_bat.jsx)
// ---------------------------------------------------------------------------

function trimString(str) {
    return String(str).replace(/^\s+|\s+$/g, "");
}

function getDefaultLanguageMap() {
    return {
        "en": "English (en)",
        "de": "German (de)"
    };
}

function languageMapToList(langMap) {
    var list = [];
    for (var tag in langMap) {
        if (langMap.hasOwnProperty(tag)) {
            list.push({ tag: tag, label: langMap[tag] });
        }
    }
    return sortLanguageListByLabel(list);
}

function getDefaultLanguageList() {
    return languageMapToList(getDefaultLanguageMap());
}

function sortLanguageListByLabel(list) {
    list.sort(function(a, b) {
        var al = String(a.label).toLowerCase();
        var bl = String(b.label).toLowerCase();
        if (al < bl) return -1;
        if (al > bl) return 1;
        return 0;
    });
    return list;
}

function getHelpFolderPath() {
    return File($.fileName).path + "/../../help/";
}

/**
 * @param {string} [dialogTitle] Optional. Default "XLIFF Warning".
 */
function loadBcp47LanguageList(dialogTitle) {
    var listFile = new File(getHelpFolderPath() + "bcp47_languages.txt");
    return loadBcp47LanguageListFromFile(listFile, true, dialogTitle || "XLIFF Warning");
}

/**
 * @param {string} [dialogTitle] Optional. Default "Batch Import Warning".
 */
function loadBcp47FavoriteLanguageList(dialogTitle) {
    var listFile = new File(getHelpFolderPath() + "bcp47_languages_favorite.txt");
    return loadBcp47LanguageListFromFile(listFile, false, dialogTitle || "Batch Import Warning");
}

/**
 * @param {File} listFile
 * @param {boolean} showErrorAlert
 * @param {string} [dialogTitle] Optional. "XLIFF Warning" or "Batch Import Warning"
 */
function loadBcp47LanguageListFromFile(listFile, showErrorAlert, dialogTitle) {
    var title = (dialogTitle && dialogTitle.length > 0) ? dialogTitle : "Warning";
    if (!listFile.exists) {
        if (showErrorAlert) {
            showAlertDialog(title, "Language list file not found:\n" + listFile.fsName + "\n\nUsing default list.");
        }
        return getDefaultLanguageList();
    }

    if (!listFile.open("r")) {
        if (showErrorAlert) {
            showAlertDialog(title, "Unable to open language list file:\n" + listFile.fsName + "\n\nUsing default list.");
        }
        return getDefaultLanguageList();
    }

    var raw = listFile.read();
    listFile.close();

    var lines = raw.split(/\r\n|\n|\r/);
    var result = [];
    var seenTags = {};
    var bcp47Pattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

    for (var i = 0; i < lines.length; i++) {
        var line = trimString(lines[i]);
        if (!line || line.indexOf("//") === 0) continue;

        var sepIndex = line.indexOf("|");
        if (sepIndex === -1) continue;

        var tag = trimString(line.substring(0, sepIndex));
        var label = trimString(line.substring(sepIndex + 1));
        if (!tag || !label) continue;
        if (!bcp47Pattern.test(tag)) continue;
        if (seenTags[tag]) continue;

        seenTags[tag] = true;
        result.push({ tag: tag, label: label });
    }

    if (result.length === 0) {
        if (showErrorAlert) {
            showAlertDialog(title, "Language list is empty or invalid.\n\nUsing default list.");
        }
        return getDefaultLanguageList();
    }

    return sortLanguageListByLabel(result);
}
