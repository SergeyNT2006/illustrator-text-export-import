/**
 * Adobe CEP panel background color red-channel values for theme detection.
 * These are empirical values from appSkinInfo.panelBackgroundColor.color
 * and may vary across CEP/Illustrator versions.
 * @see https://github.com/Adobe-CEP/CEP-Resources
 */
const THEME_RED_DARKER = 50;   // Darkest theme (e.g. dark UI mode)
const THEME_RED_DARK = 83;     // Dark theme
const THEME_RED_LIGHT = 184;   // Light theme
const THEME_RED_DEFAULT = 240; // Default/lightest (no data-theme override)

function changeTheme(csInterface) {
 let appSkinInfo = csInterface.hostEnvironment.appSkinInfo;

 updateThemeWithAppSkinInfo(appSkinInfo);

 csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);

 /**
  * Update the theme with the AppSkinInfo retrieved from the host product.
  */
 function updateThemeWithAppSkinInfo(appSkinInfo) {
  let appBgColor = appSkinInfo.panelBackgroundColor.color;
  let html = document.documentElement;

  html.style.fontSize = appSkinInfo.baseFontSize + 'px';

  if (appBgColor.red == THEME_RED_DARKER) {
   html.setAttribute('data-theme', 'darker');
  } else if (appBgColor.red == THEME_RED_DARK) {
   html.setAttribute('data-theme', 'dark');
  } else if (appBgColor.red == THEME_RED_LIGHT) {
   html.setAttribute('data-theme', 'light');
  } else if (appBgColor.red == THEME_RED_DEFAULT) {
   html.removeAttribute('data-theme');
  }
 }

 function onAppThemeColorChanged(event) {
  var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
  updateThemeWithAppSkinInfo(skinInfo);
 }
}
