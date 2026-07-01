// Trigger the browser's print-to-PDF for the directory pages currently on
// screen. The print stylesheet (DirectorySheet.css / LeaderPage.css) sizes each
// sheet to the design's page size and hides all app chrome, so "Save as PDF"
// yields a pixel-perfect, vector, print-quality document. `filename` becomes the
// default save name (via the document title).
export function printPdf(filename: string) {
  const previous = document.title
  document.title = filename
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}
