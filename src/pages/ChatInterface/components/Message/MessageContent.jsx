import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

const MessageContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code: CodeBlock,
      li({ children, ...props }) {
        return (
          <li {...props}>
            {React.Children.map(children, (child, index) =>
              typeof child === 'string' ? child : <span key={index}>{child}</span>
            )}
          </li>
        );
      },
      p({ children, node, ...props }) {
        if (node?.parent?.type === 'listItem') {
          return <>{children}</>;
        }
        return <p {...props}>{children}</p>;
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MessageContent;