import ReactMarkdownLibrary, { Components } from "react-markdown";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { HTMLAttributes } from "react";
// Removed MdastNode imports to avoid conflict

import { Markdown } from "./components/markdown";

// Simplified MdastNode for internal use, if needed, but for now using any for `node`
// type MdastNode = (Parent | Literal) & {
//   data?: {
//     hProperties?: Record<string, any>;
//   };
//   position?: {
//     start: { line: number; column: number; offset: number };
//     end: { line: number; column: number; offset: number };
//     indent?: number[];
//   };
// };

const getMarkdownComponents = (customProps = {}): Components => ({
  a: ({
    node,
    ...props
  }: HTMLAttributes<HTMLAnchorElement> & { node?: any }) => {
    // Change MdastNode to any
    const nodeCustomProps = (node as any)?.data?.hProperties ?? {};
    return (
      <Markdown.Anchor
        node={node}
        {...props}
        {...nodeCustomProps}
        {...customProps}
      />
    );
  },
  li: ({ node, ...props }: HTMLAttributes<HTMLLIElement> & { node?: any }) => (
    <Markdown.Li node={node} {...props} {...customProps} />
  ), // Change MdastNode to any
});

export type ReactMarkdownProps = Parameters<typeof ReactMarkdownLibrary>[0] & {
  customProps?: Record<string, any>;
};

export const ReactMarkdown = (props: ReactMarkdownProps) => {
  const { customProps = {}, components: consumerComponents, ...rest } = props;
  return (
    <ReactMarkdownLibrary
      components={{
        ...getMarkdownComponents(customProps),
        ...consumerComponents,
      }}
      remarkPlugins={[emoji, remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      skipHtml={false}
      {...rest}
    />
  );
};
