export type TabType = 'markdown' | 'html' | 'json' | 'sql';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'markdown', label: 'Markdown', icon: 'book' },
  { id: 'html', label: 'HTML', icon: 'code' },
  { id: 'json', label: 'JSON', icon: 'file-json' },
  { id: 'sql', label: 'SQL', icon: 'database' },
];

export const DEMO_CONTENT: Record<TabType, string> = {
  markdown: `# 欢迎使用 Easy Preview

一个简洁的 **Markdown** 与 **HTML** 实时预览工具，支持语法错误检测。

## 功能特性

- Markdown 语法高亮与预览
- HTML 实时渲染与预览
- 语法错误检测，精确定位到行与列
- 错误红色高亮标注，一目了然

### 代码示例

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

> 输入内容后点击「预览」按钮，或使用 \`Ctrl + Enter\` 快捷键

| 功能 | 状态 |
|------|------|
| Markdown 预览 | 已支持 |
| HTML 预览 | 已支持 |
| 错误检测 | 已支持 |

---

*试试输入一些有语法错误的内容，看看错误提示效果吧！*`,

  html: `<div style="padding: 1rem; background: #1e293b; border-radius: 8px;">
  <h2 style="color: #93c5fd; margin-bottom: 0.5rem;">
    欢迎使用 HTML 预览
  </h2>
  <p style="color: #cbd5e1; line-height: 1.6;">
    这是一个 HTML 实时渲染示例。
  </p>
  <div style="margin: 1rem 0;">
    <ul style="color: #cbd5e1; padding-left: 1.5rem;">
      <li>实时渲染 HTML 代码</li>
      <li>支持内联样式</li>
      <li>支持基础交互</li>
    </ul>
  </div>
  <button style="
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  " onclick="alert('Hello from HTML!')">
    点击我
  </button>
</div>`,

  json: `{
  "name": "Easy Preview",
  "version": "1.0.0",
  "features": {
    "markdown": true,
    "html": true,
    "json": true,
    "sql": true
  },
  "settings": {
    "theme": "dark",
    "autoPreview": false,
    "lineNumbers": true
  },
  "author": "Developer",
  "tags": ["tool", "preview", "developer"]
}`,

  sql: `-- 查询用户表
SELECT 
  u.id,
  u.username,
  u.email,
  p.title,
  p.created_at
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.status = 'active'
  AND p.created_at >= '2024-01-01'
ORDER BY p.created_at DESC
LIMIT 10;`,
};
