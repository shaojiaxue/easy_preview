// Background Service Worker

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'easy-preview',
      title: 'Easy Preview 转换',
      contexts: ['selection'],
    });

    const formats = [
      { id: 'preview-auto', title: '✨ 自动检测格式' },
      { id: 'preview-markdown', title: '📄 作为 Markdown 预览' },
      { id: 'preview-html', title: '🌐 作为 HTML 预览' },
      { id: 'preview-json', title: '📋 作为 JSON 格式化' },
      { id: 'preview-sql', title: '🗃️ 作为 SQL 格式化' },
    ];

    formats.forEach((f) => {
      chrome.contextMenus.create({
        id: f.id,
        parentId: 'easy-preview',
        title: f.title,
        contexts: ['selection'],
      });
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;

  const formatMap = {
    'preview-markdown': 'markdown',
    'preview-html': 'html',
    'preview-json': 'json',
    'preview-sql': 'sql',
    'preview-auto': 'auto',
  };

  const format = formatMap[info.menuItemId];
  if (!format) return;

  // Encode text and format into URL hash (most reliable method)
  const encodedText = encodeURIComponent(info.selectionText);
  const url = chrome.runtime.getURL(
    `index.html#text=${encodedText}&format=${format}`
  );

  // Open a properly sized popup window
  chrome.windows.create({
    url: url,
    type: 'popup',
    width: 900,
    height: 600,
    left: Math.round((screen.availWidth - 900) / 2),
    top: Math.round((screen.availHeight - 600) / 2),
    focused: true,
  });
});
