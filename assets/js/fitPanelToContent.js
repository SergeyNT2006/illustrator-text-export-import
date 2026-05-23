function fitPanelToContent() {
 setTimeout(function () {
  // CEP/Illustrator can clip the last pixels due to rounding.
  csInterface.resizeContent(document.documentElement.offsetWidth + 2, document.documentElement.offsetHeight + 6);
 }, 500);
}