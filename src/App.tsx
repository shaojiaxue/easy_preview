import { useState, useCallback, useEffect, useRef } from 'react';
import { marked } from 'marked';
import {
  BookOpen,
  Code,
  FileJson,
  Database,
  Play,
  Trash2,
  Eye,
  GripVertical,
  Download,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import type { TabType } from './types';
import { TAB_CONFIGS, DEMO_CONTENT } from './types';

const TAB_ICONS: Record<string, React.ReactNode> = {
  book: <BookOpen size={15} />,
  code: <Code size={15} />,
  'file-json': <FileJson size={15} />,
  database: <Database size={15} />,
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

// ---------- JSON syntax highlighting ----------
function highlightJson(json: string): string {
  try {
    const obj = JSON.parse(json);
    const formatted = JSON.stringify(obj, null, 2);
    return tokenizeJson(formatted);
  } catch {
    return tokenizeJson(json);
  }
}

function tokenizeJson(text: string): string {
  let result = '';
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      result += `<span class="string">\\${escapeHtml(ch)}</span>`;
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if ((ch === '"' || ch === "'") && !inString) {
      inString = true;
      stringChar = ch;
      result += `<span class="string">${ch}`;
      continue;
    }

    if (ch === stringChar && inString) {
      inString = false;
      result += `${ch}</span>`;
      stringChar = '';
      continue;
    }

    if (inString) {
      result += escapeHtml(ch);
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(text[i + 1] || ''))) {
      let num = ch;
      let j = i + 1;
      while (j < text.length && /[0-9.eE+-]/.test(text[j])) {
        num += text[j];
        j++;
      }
      result += `<span class="number">${num}</span>`;
      i = j - 1;
      continue;
    }

    if (ch === 't' && text.slice(i, i + 4) === 'true') {
      result += `<span class="boolean">true</span>`;
      i += 3;
      continue;
    }
    if (ch === 'f' && text.slice(i, i + 5) === 'false') {
      result += `<span class="boolean">false</span>`;
      i += 4;
      continue;
    }
    if (ch === 'n' && text.slice(i, i + 4) === 'null') {
      result += `<span class="null">null</span>`;
      i += 3;
      continue;
    }

    if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === ':' || ch === ',') {
      result += `<span class="punctuation">${escapeHtml(ch)}</span>`;
      continue;
    }

    result += escapeHtml(ch);
  }

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------- SQL syntax highlighting ----------
function highlightSql(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
    'ALTER', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'BETWEEN',
    'LIKE', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
    'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'ASC', 'DESC',
    'VALUES', 'SET', 'INTO', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'CONSTRAINT', 'UNIQUE', 'CHECK', 'IF', 'ELSE', 'WHEN', 'THEN', 'CASE', 'END',
    'CAST', 'CONVERT', 'CHAR', 'VARCHAR', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT',
    'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'DATE', 'TIME', 'DATETIME',
    'TIMESTAMP', 'BOOLEAN', 'TEXT', 'BLOB',
  ];

  const functions = [
    'ABS', 'ROUND', 'CEIL', 'FLOOR', 'MOD', 'POWER', 'SQRT',
    'LENGTH', 'SUBSTRING', 'CONCAT', 'TRIM', 'UPPER', 'LOWER',
    'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'DATE_ADD', 'DATE_SUB',
    'COALESCE', 'NULLIF', 'IFNULL',
  ];

  let result = '';
  let i = 0;

  while (i < sql.length) {
    // Comments
    if (sql.slice(i, i + 2) === '--') {
      let end = sql.indexOf('\n', i);
      if (end === -1) end = sql.length;
      result += `<span class="comment">${escapeHtml(sql.slice(i, end))}</span>`;
      i = end;
      continue;
    }
    if (sql.slice(i, i + 2) === '/*') {
      let end = sql.indexOf('*/', i + 2);
      if (end === -1) end = sql.length;
      result += `<span class="comment">${escapeHtml(sql.slice(i, end + 2))}</span>`;
      i = end + 2;
      continue;
    }

    // Strings
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) {
        if (sql[j] === '\\') j++;
        j++;
      }
      result += `<span class="string">${escapeHtml(sql.slice(i, j + 1))}</span>`;
      i = j + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      result += `<span class="number">${sql.slice(i, j)}</span>`;
      i = j;
      continue;
    }

    // Words
    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();

      if (keywords.includes(upper)) {
        result += `<span class="keyword">${word}</span>`;
      } else if (functions.includes(upper)) {
        result += `<span class="function">${word}</span>`;
      } else {
        result += `<span class="identifier">${word}</span>`;
      }
      i = j;
      continue;
    }

    // Operators
    if (/[+\-*/=<>,;!]/.test(sql[i])) {
      result += `<span class="operator">${escapeHtml(sql[i])}</span>`;
      i++;
      continue;
    }

    result += escapeHtml(sql[i]);
    i++;
  }

  return result;
}

// ---------- Line Numbers ----------
function getLineNumbers(text: string): string {
  const lines = text.split('\n').length;
  return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

// ---------- Main App ----------
function App() {
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [editorContent, setEditorContent] = useState(DEMO_CONTENT.markdown);
  const [previewContent, setPreviewContent] = useState(DEMO_CONTENT.markdown);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState(getLineNumbers(DEMO_CONTENT.markdown));

  // Handle tab switch
  const handleTabSwitch = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const demo = DEMO_CONTENT[tab];
    setEditorContent(demo);
    setPreviewContent(demo);
    setLineNumbers(getLineNumbers(demo));
  }, []);

  // Update line numbers on content change
  useEffect(() => {
    setLineNumbers(getLineNumbers(editorContent));
  }, [editorContent]);

  // Preview handler
  const handlePreview = useCallback(() => {
    setPreviewContent(editorContent);
  }, [editorContent]);

  // Clear handler
  const handleClear = useCallback(() => {
    setEditorContent('');
    setPreviewContent('');
    setLineNumbers('1');
  }, []);

  // Keyboard shortcut Ctrl+Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handlePreview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePreview]);

  // Split pane drag
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setLeftWidth(Math.max(20, Math.min(80, pct)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ---------- PDF Download ----------
  const markdownRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<HTMLIFrameElement>(null);

  const downloadPdf = useCallback(() => {
    let element: HTMLElement | null = null;
    let filename = 'preview.pdf';

    if (activeTab === 'markdown') {
      element = markdownRef.current;
      filename = 'markdown-preview.pdf';
    } else if (activeTab === 'html') {
      const iframe = htmlRef.current;
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        element = iframe.contentDocument.body;
        filename = 'html-preview.pdf';
      }
    }

    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(element).save();
  }, [activeTab]);

  // Render preview based on active tab
  const renderPreview = () => {
    switch (activeTab) {
      case 'markdown': {
        const html = marked.parse(previewContent) as string;
        return (
          <div
            ref={markdownRef}
            className="markdown-preview p-6 overflow-auto h-full"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      case 'html': {
        return (
          <iframe
            ref={htmlRef}
            srcDoc={`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: #ffffff; color: #0f172a; }
*{box-sizing:border-box}
</style>
</head>
<body>${previewContent}</body>
</html>`}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        );
      }
      case 'json': {
        const highlighted = highlightJson(previewContent);
        return (
          <pre className="json-preview p-6 overflow-auto h-full text-sm leading-relaxed whitespace-pre">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        );
      }
      case 'sql': {
        const highlighted = previewContent ? highlightSql(previewContent) : '';
        return (
          <pre className="sql-preview p-6 overflow-auto h-full text-sm leading-relaxed whitespace-pre">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b border-[#e2e8f0] bg-white shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-8">
          <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="text-[#0f172a] font-semibold text-[15px] tracking-tight">
            Easy Preview
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {TAB_CONFIGS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium
                transition-all duration-150 cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                }
              `}
            >
              {TAB_ICONS[tab.icon]}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Editor Toolbar */}
          <div className="h-9 flex items-center justify-between px-3 bg-white border-b border-[#e2e8f0] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-semibold">
                {activeTab} 编辑器
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[12px] text-[#64748b]
                           hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all cursor-pointer"
                title="清空"
              >
                <Trash2 size={13} />
                清空
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-1 px-3 py-1 rounded text-[12px] bg-[#3b82f6] text-white
                           hover:bg-[#2563eb] transition-all cursor-pointer"
                title="预览 (Ctrl+Enter)"
              >
                <Play size={13} />
                预览
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers */}
            <div className="w-12 bg-[#f8fafc] border-r border-[#e2e8f0] shrink-0 overflow-hidden pt-3">
              <pre className="line-numbers pr-3 pt-[2px]">{lineNumbers}</pre>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="editor-textarea flex-1 bg-white text-[#0f172a] p-3 resize-none border-0
                         outline-none focus:ring-0 whitespace-pre"
              spellCheck={false}
              style={{ overflow: 'auto' }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          className={`split-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-full flex items-center justify-center">
            <GripVertical size={12} className="text-[#cbd5e1]" />
          </div>
        </div>

        {/* Right: Preview */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Preview Header */}
          <div className="h-9 flex items-center justify-between px-3 bg-white border-b border-[#e2e8f0] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <Eye size={13} className="text-[#94a3b8]" />
              <span className="text-[11px] uppercase tracking-wider text-[#94a3b8] font-semibold">
                预览
              </span>
            </div>
            {(activeTab === 'markdown' || activeTab === 'html') && (
              <button
                onClick={downloadPdf}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[12px] text-[#64748b]
                           hover:text-[#2563eb] hover:bg-[#eff6ff] transition-all cursor-pointer"
                title="下载 PDF"
              >
                <Download size={13} />
                PDF
              </button>
            )}
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden bg-white">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
