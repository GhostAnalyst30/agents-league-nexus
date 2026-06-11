import { Fragment, type ReactElement, type JSX } from "react";

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
      parts.push(
        <strong key={match.index} className="font-bold">
          <em>{match[2]}</em>
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      parts.push(<em key={match.index}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs font-mono text-accent"
        >
          {match[5]}
        </code>
      );
    } else if (match[6] && match[7]) {
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {match[6]}
        </a>
      );
    } else if (match[8]) {
      parts.push(
        <del key={match.index} className="text-muted line-through">
          {match[8]}
        </del>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts;
}

function parseLine(line: string): JSX.Element | null {
  const trimmed = line.trim();

  if (!trimmed) return <br />;

  // Headers
  const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
  if (headerMatch) {
    const level = headerMatch[1].length;
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const size = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-xs"][
      level - 1
    ];
    return (
      <Tag className={`font-bold mt-4 mb-2 ${size}`}>
        {parseInline(headerMatch[2])}
      </Tag>
    );
  }

  // Blockquote
  if (trimmed.startsWith("> ")) {
    return (
      <blockquote className="border-l-2 border-accent/30 pl-4 italic text-muted my-2">
        {parseInline(trimmed.slice(2))}
      </blockquote>
    );
  }

  // Unordered list
  const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
  if (ulMatch) {
    return (
      <li className="ml-4 list-disc text-sm my-0.5">
        {parseInline(ulMatch[1])}
      </li>
    );
  }

  // Ordered list
  const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
  if (olMatch) {
    return (
      <li className="ml-4 list-decimal text-sm my-0.5">
        {parseInline(olMatch[1])}
      </li>
    );
  }

  // Horizontal rule
  if (/^---/.test(trimmed)) {
    return <hr className="border-border my-4" />;
  }

  // Regular paragraph
  return <p className="text-sm leading-relaxed my-1.5">{parseInline(line)}</p>;
}

export default function Markdown({ content }: { content: string }) {
  // Split code blocks first
  const blocks: { type: "code" | "text"; content: string; lang?: string }[] =
    [];
  let remaining = content;
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(remaining)) !== null) {
    if (match.index > 0) {
      blocks.push({
        type: "text",
        content: remaining.slice(0, match.index),
      });
    }
    blocks.push({
      type: "code",
      lang: match[1] || "text",
      content: match[2],
    });
    remaining = remaining.slice(match.index + match[0].length);
  }

  if (remaining.length > 0) {
    blocks.push({ type: "text", content: remaining });
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return (
            <pre
              key={i}
              className="bg-zinc-900 border border-border rounded-xl p-4 overflow-x-auto my-3"
            >
              <code className="text-xs font-mono leading-relaxed text-zinc-200">
                {escapeHtml(block.content.trimEnd())}
              </code>
            </pre>
          );
        }

        const lines = block.content.split("\n");
        return (
          <Fragment key={i}>
            {lines.map((line, j) => (
              <Fragment key={j}>{parseLine(line)}</Fragment>
            ))}
          </Fragment>
        );
      })}
    </div>
  );
}
