import { Fragment, type ReactElement } from "react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): (string | ReactElement)[] {
  const parts: (string | ReactElement)[] = [];
  let remaining = escapeHtml(text);
  const regex =
    /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)|~~(.+?)~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={match.index} className="font-bold"><em>{match[2]}</em></strong>);
    } else if (match[3]) {
      parts.push(<strong key={match.index} className="font-semibold">{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={match.index}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(<code key={match.index} className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-accent">{match[5]}</code>);
    } else if (match[6] && match[7]) {
      parts.push(<a key={match.index} href={match[7]} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{match[6]}</a>);
    } else if (match[8]) {
      parts.push(<del key={match.index} className="text-muted line-through">{match[8]}</del>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts;
}

function parseLine(line: string): ReactElement | null {
  const trimmed = line.trim();
  if (!trimmed) return <br />;

  const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
  if (headerMatch) {
    const level = headerMatch[1].length;
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    const size = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"][level - 1];
    return <Tag className={`font-bold mt-4 mb-2 ${size}`}>{parseInline(headerMatch[2])}</Tag>;
  }

  if (trimmed.startsWith("> ")) {
    return <blockquote className="border-l-2 border-accent/30 pl-4 italic text-muted my-2">{parseInline(trimmed.slice(2))}</blockquote>;
  }

  const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
  if (ulMatch) return <li className="ml-4 list-disc text-sm my-0.5">{parseInline(ulMatch[1])}</li>;

  const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
  if (olMatch) return <li className="ml-4 list-decimal text-sm my-0.5">{parseInline(olMatch[1])}</li>;

  if (/^---$/.test(trimmed)) return <hr className="border-border my-4" />;

  return <p className="text-sm leading-relaxed my-1.5">{parseInline(line)}</p>;
}

function parseTableBlock(lines: string[]): { table: ReactElement | null; consumed: number } {
  if (lines.length < 2) return { table: null, consumed: 0 };

  const first = lines[0].trim();
  const second = lines[1].trim();
  if (!first.startsWith("|") || !first.endsWith("|")) return { table: null, consumed: 0 };
  if (!second.startsWith("|") || !second.endsWith("|")) return { table: null, consumed: 0 };
  if (!/\|[-:\s]+\|/.test(second)) return { table: null, consumed: 0 };

  const headers = first.split("|").filter((s) => s.trim()).map((s) => s.trim());
  const alignRow = second.split("|").filter((s) => s.trim());

  let rowCount = 2;
  while (rowCount < lines.length) {
    const row = lines[rowCount].trim();
    if (!row.startsWith("|") || !row.endsWith("|")) break;
    rowCount++;
  }

  const rows: string[][] = [];
  for (let i = 2; i < rowCount; i++) {
    const cells = lines[i].split("|").filter((s) => s.trim()).map((s) => s.trim());
    rows.push(cells);
  }

  const table = (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-semibold px-3 py-2 text-muted-foreground">{parseInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/50 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2">{parseInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return { table, consumed: rowCount };
}

function renderTextBlock(content: string): ReactElement[] {
  const elements: ReactElement[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const { table, consumed } = parseTableBlock(lines.slice(i));
    if (table) {
      elements.push(<Fragment key={`t${i}`}>{table}</Fragment>);
      i += consumed;
    } else {
      const el = parseLine(lines[i]);
      if (el) elements.push(<Fragment key={`l${i}`}>{el}</Fragment>);
      i++;
    }
  }

  return elements;
}

export default function Markdown({ content }: { content: string }) {
  const blocks: { type: "code" | "text"; content: string; lang?: string }[] = [];
  let remaining = content;
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(remaining)) !== null) {
    if (match.index > 0) blocks.push({ type: "text", content: remaining.slice(0, match.index) });
    blocks.push({ type: "code", lang: match[1] || "text", content: match[2] });
    remaining = remaining.slice(match.index + match[0].length);
  }

  if (remaining.length > 0) blocks.push({ type: "text", content: remaining });

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return (
            <pre key={i} className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto my-3">
              <code className="text-xs font-mono leading-relaxed text-zinc-200">
                {escapeHtml(block.content.trimEnd())}
              </code>
            </pre>
          );
        }
        return <Fragment key={i}>{renderTextBlock(block.content)}</Fragment>;
      })}
    </div>
  );
}
