import React from 'react';
import { useClipboard } from '../../hooks/useClipboard';

const CopyButton = ({ code, codeId, copiedCode, copyToClipboard }) => (
  <button className="copy-code-btn" onClick={() => copyToClipboard(code, codeId)} title="Copy code">
    <span className="copy-icon">{copiedCode === codeId ? '✅' : '📋'}</span>
    <span className="copy-text">{copiedCode === codeId ? 'Copied!' : 'Copy'}</span>
  </button>
);

const CodeBlock = ({ inline, className, children, ...props }) => {
  const { copiedCode, copyToClipboard } = useClipboard();
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');
  const codeId = `code-${Date.now()}-${Math.random()}`;

  if (!inline && codeString.includes('\n')) {
    return (
      <div className="code-block-wrapper">
        <div className="code-header">
          {language && <div className="code-language">{language.toUpperCase()}</div>}
          <CopyButton code={codeString} codeId={codeId} copiedCode={copiedCode} copyToClipboard={copyToClipboard} />
        </div>
        <pre className="block-code">
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    );
  }

  return <code className="inline-code" {...props}>{children}</code>;
};

export default CodeBlock;