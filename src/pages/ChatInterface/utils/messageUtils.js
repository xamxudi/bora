export const cleanSingleCodeLines = (content) => {
  return content.replace(/```([^\n]*)```/g, (match, inner) => {
    if (!inner.includes('\n') && inner.length < 30) {
      return inner;
    }
    return match;
  });
};

export const fixMarkdownList = (text) => {
  return text.replace(/^(\d+)\.\s+(\*\*[^:]+:\*)(?!\s*\n)/gm, '$1. $2\n');
};

export const processStreamingContent = (content) => {
  const codeBlockMarkers = (content.match(/```/g) || []).length;
  let result = content;
  if (codeBlockMarkers % 2 === 1) {
    result += '\n```';
  }
  result = cleanSingleCodeLines(result);
  result = fixMarkdownList(result);
  return result;
};