"use client"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  const html = renderMarkdown(content)

  return (
    <div
      className={`markdown-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text)

  // Code blocks (```code```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    const escaped = escapeHtml(code.trim())
    return `<pre class="bg-[rgba(255,255,255,0.04)] rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono leading-relaxed border border-[rgba(255,255,255,0.06)]"><code>${escaped}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[rgba(255,255,255,0.06)] rounded px-1.5 py-0.5 text-xs font-mono">$1</code>')

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>")

  // Headers (### then ## then #)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-white font-semibold text-sm mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-white font-semibold text-base mt-5 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-white font-bold text-lg mt-5 mb-2">$1</h1>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-[#c0c0d0] text-sm ml-4 pl-1 -indent-4 before:content-["–"] before:mr-2 before:text-[#7c6cf0]">$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="text-[#c0c0d0] text-sm ml-4 pl-1 list-decimal">$1</li>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-4 border-[rgba(255,255,255,0.06)]" />')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-[#7c6cf0] pl-4 my-2 text-sm text-[#a99aff] italic">$1</blockquote>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#7c6cf0] hover:text-[#a99aff] underline underline-offset-2 transition-colors">$1</a>')

  // Paragraphs: wrap consecutive non-empty, non-tag lines
  const lines = html.split("\n")
  const wrapped: string[] = []
  let inParagraph = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inParagraph) {
        wrapped.push("</p>")
        inParagraph = false
      }
      wrapped.push("")
      continue
    }

    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("</li") ||
      trimmed.startsWith("</ul") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("</ol")
    ) {
      if (inParagraph) {
        wrapped.push("</p>")
        inParagraph = false
      }
      wrapped.push(trimmed)
      continue
    }

    if (!inParagraph) {
      wrapped.push(`<p class="text-[#c0c0d0] text-sm mb-2 leading-relaxed">${trimmed}`)
      inParagraph = true
    } else {
      wrapped.push(trimmed)
    }
  }

  if (inParagraph) wrapped.push("</p>")

  return wrapped.join("\n")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
