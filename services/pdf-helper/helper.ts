import Pdfjs, { PDFPageProxy } from 'pdfjs-dist';

async function render_page(pageData: PDFPageProxy) {
  const textContent = await pageData.getTextContent();
  let lastY: number;
  let text = '';
  for (let item of textContent.items) {
    if (lastY == item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += '\n' + item.str;
    }
    lastY = item.transform[5];
  }
  return text;
}

const DEFAULT_OPTIONS = {
  pagerender: render_page,
  max: 0,
  onePageOnly: 0,
};

async function Pdf(dataBuffer: BufferSource, options?) {
  const ret = {
    numpages: 0,
    numrender: 0,
    info: null,
    metadata: null,
    text: '',
    version: null,
  };

  if (typeof options == 'undefined') options = DEFAULT_OPTIONS;
  if (typeof options.pagerender != 'function')
    options.pagerender = DEFAULT_OPTIONS.pagerender;
  if (typeof options.max != 'number') options.max = DEFAULT_OPTIONS.max;

  ret.version = Pdfjs.version;

  // Pdfjs.PDFJS.disableWorker = true;
  const doc = await Pdfjs.getDocument(dataBuffer).promise;
  ret.numpages = doc.numPages;

  const metaData = await doc.getMetadata();

  ret.info = metaData ? metaData.info : null;
  ret.metadata = metaData ? metaData.metadata : null;

  const onePageOnly = options.onePageOnly <= 0 ? 0 : options.onePageOnly;
  let counter = options.max <= 0 ? doc.numPages : options.max;
  counter = counter > doc.numPages ? doc.numPages : counter;

  ret.text = '';

  if (onePageOnly > 0) {
    const pageText = await doc
      .getPage(onePageOnly)
      .then((pageData) => options.pagerender(pageData));
    ret.text = `${ret.text}\n\n${pageText}`;
    return ret;
  }
  for (var i = 1; i <= counter; i++) {
    const pageText = await doc
      .getPage(i)
      .then((pageData) => options.pagerender(pageData));

    ret.text = `${ret.text}\n\n${pageText}`;
  }

  ret.numrender = counter;
  doc.destroy();

  return ret;
}

export default Pdf;
