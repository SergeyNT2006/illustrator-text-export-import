const csInterface = new CSInterface();

try { fitPanelToContent(); } catch (e) { }
try { changeTheme(csInterface); } catch (e) { }

const btn_expToXml = document.getElementById('btn_expToXml'),
  btn_impFromXml = document.getElementById('btn_impFromXml'),
  btn_expToXliff = document.getElementById('btn_expToXliff'),
  btn_impFromXliff = document.getElementById('btn_impFromXliff'),
  btn_batchExp = document.getElementById('btn_batchExp'),
  btn_batchImp = document.getElementById('btn_batchImp'),
  btn_about = document.getElementById('btn_about'),
  btn_help = document.getElementById('btn_help'),
  btn_reload = document.getElementById('btn_reload'),
  modeLabel = document.getElementById('mode_label');

let activeModeLabel = 'Mode(native)';
let activeScriptFolder = 'functions';

function setModeUi(label) {
  activeModeLabel = label;
  if (modeLabel) {
    modeLabel.textContent = label;
  }
}

/** Escapes a string for safe embedding inside double-quoted JavaScript string in eval. */
function escapeForEval(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function showHostAlert(title, message) {
  const safeTitle = escapeForEval(title || 'Message');
  const safeMessage = escapeForEval(message || '');
  csInterface.evalScript(`showAlertDialog("${safeTitle}", "${safeMessage}")`, function () {});
}

function resolveScriptMode() {
  const extRoot = csInterface.getSystemPath(SystemPath.EXTENSION).replace(/\\/g, '/');
  const safeRoot = escapeForEval(extRoot);
  csInterface.evalScript(`
    (function () {
      try {
        var root = "${safeRoot}";
        var nativeDir = new Folder(root + "/assets/jsx/functions");
        var binDir = new Folder(root + "/assets/jsx/func_bin");
        var demoDir = new Folder(root + "/assets/jsx/func_demo");
        if (nativeDir.exists) return "native|functions|Mode(native)";
        if (binDir.exists) return "bin|func_bin|Mode(bin)";
        if (demoDir.exists) return "demo|func_demo|Demo mode";
        return "none||Mode unavailable";
      } catch (e) {
        return "none||Mode unavailable";
      }
    })();
  `, function (result) {
    const raw = String(result || '');
    const parts = raw.split('|');
    if (parts.length >= 3 && parts[0] !== 'none' && parts[1]) {
      activeScriptFolder = parts[1];
      setModeUi(parts[2]);
      return;
    }
    activeScriptFolder = '';
    setModeUi('Mode unavailable');
    showHostAlert('Mode Error', 'No script mode folders found. Expected one of: assets/jsx/functions, assets/jsx/func_bin, assets/jsx/func_demo.');
  });
}

/**
 * Execute a standalone ExtendScript file from the extension root.
 * Standalone files live in one of: assets/jsx/functions, func_bin, func_demo.
 * JSX functions return "OK: message", "ERROR: message", or "CANCEL".
 */
function runStandAloneJsx(fileName) {
  if (!activeScriptFolder) {
    showHostAlert('Mode Error', 'Script mode is not available.');
    return;
  }
  const extRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
  const filePath = (extRoot + '/assets/jsx/' + activeScriptFolder + '/' + fileName).replace(/\\/g, '/');
  const safeFilePath = escapeForEval(filePath);

  csInterface.evalScript(`
    var __r = "ERROR: Unknown error";
    try {
      var f = new File("${safeFilePath}");
      if (!f.exists) throw new Error("JSX file not found: " + f.fsName);
      var __v = $.evalFile(f);
      __r = (__v !== undefined && __v !== null) ? String(__v) : "OK";
    } catch (e) {
      __r = "ERROR: " + e;
    }
    __r;
  `, function(result) {
    if (!result || result === 'CANCEL') return;
    // OK/ERROR alerts are shown in JSX; callback only handles errors not caught there
    if (result.indexOf('ERROR:') === 0) {
      showHostAlert('Error', result.substring(7).trim());
    }
  });
}

resolveScriptMode();

try {
  btn_expToXml.addEventListener('click', () => {
    runStandAloneJsx('exp_xml.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }

try {
  btn_impFromXml.addEventListener('click', () => {
    runStandAloneJsx('imp_xml.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }


try {
  btn_expToXliff.addEventListener('click', () => {
    runStandAloneJsx('exp_xliff.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }


try {
  btn_impFromXliff.addEventListener('click', () => {
    runStandAloneJsx('imp_xliff.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }



try {
  btn_batchExp.addEventListener('click', () => {
    runStandAloneJsx('exp_bat.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }

try {
  btn_batchImp.addEventListener('click', () => {
    runStandAloneJsx('imp_bat.jsx');
    return;
  });
} catch (e) { showHostAlert('UI Error', e); }

try {
  btn_reload.addEventListener('click', () => {
    reloadPanel();
    fitPanelToContent();
  });
} catch (e) { showHostAlert('UI Error', e); }

try {
  btn_about.addEventListener('click', () => {
    const extRoot = csInterface.getSystemPath(SystemPath.EXTENSION).replace(/\\/g, '/');
    csInterface.evalScript(`showAbout("${escapeForEval(extRoot)}")`, function (res) { });
  });
} catch (e) { showHostAlert('UI Error', e); }

try {
  btn_help.addEventListener('click', () => {
    const extRoot = csInterface.getSystemPath(SystemPath.EXTENSION).replace(/\\/g, '/');
    csInterface.evalScript(`showHelp("${escapeForEval(extRoot)}")`, function (res) { });
  });
} catch (e) { showHostAlert('UI Error', e); }


