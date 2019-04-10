module.exports = {
  limits: {
    fileSize: 8 * 1024 * 1024// 1MB
  },
  path: {
    chatimgDir: './public/trpg-chat-image/'
  },
  svgBg: [
    '#333333',
    '#2c3e50',
    '#8e44ad',
    '#2980b9',
    '#27ae60',
    '#16a085',
    '#f39c12',
    '#d35400',
    '#c0392b',
    '#3498db',
    '#9b59b6',
    '#2ecc71',
    '#1abc9c',
    '#f1c40f',
    '#e74c3c',
    '#e67e22',
  ],
  getOfficePreviewUrl: function(fileurl) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileurl)}`;
  },
  canPreviewExt: [
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    '.pdf',
    'jpg',
    'png',
  ]
}
