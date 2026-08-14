import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import styles from "./markdown.module.scss";

function MarkdownLink({
  href,
  node,
  ...props
}: ComponentPropsWithoutRef<"a"> & ExtraProps) {
  void node; // react-markdown's internal AST node — must not reach the DOM element
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target={isExternal ? "_blank" : undefined}
      {...props}
    />
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className={styles.markdown}>
      {/* rehypeSanitize must run before rehypeHighlight: sanitize strips
          dangerous markup first, then highlight adds its hljs-* classes to
          the already-safe tree — reversing the order would let sanitize
          strip the highlighting classes it doesn't recognize. */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{ a: MarkdownLink }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
