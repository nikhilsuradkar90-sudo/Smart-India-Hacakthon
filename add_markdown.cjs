const fs = require('fs');
const p = 'src/pages/AssistantPage.tsx';
let c = fs.readFileSync(p, 'utf-8');

// 1. Add imports at the top
if (!c.includes('import ReactMarkdown')) {
    const importStatement = `import { AssistantMessage } from '@/types';\nimport ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';`;
    c = c.replace(`import { AssistantMessage } from '@/types';`, importStatement);
}

// 2. Replace user message rendering
// <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap notranslate">
//   {message.content}
// </div>
const userTarget = `<div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap notranslate">
            {message.content}
          </div>`;
const userReplacement = `<div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap notranslate">
            {message.content}
          </div>`;
// User message doesn't strictly need markdown, but we'll leave it as is.

// 3. Replace AI message rendering
const aiTarget = `<div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap notranslate">
              {message.content}
            </div>`;
const aiReplacement = `<div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed notranslate markdown-body">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full text-left border-collapse" {...props} /></div>,
                  th: ({node, ...props}) => <th className="border-b border-border bg-muted/50 p-2 font-medium" {...props} />,
                  td: ({node, ...props}) => <td className="border-b border-border p-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>`;

if (c.includes(aiTarget)) {
    c = c.replace(aiTarget, aiReplacement);
    fs.writeFileSync(p, c);
    console.log("Successfully injected ReactMarkdown!");
} else {
    console.log("Target string not found in AssistantPage.tsx");
}
