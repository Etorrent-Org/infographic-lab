import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  source: string;
};

export function MarkdownView({ source }: Props) {
  return (
    <div className="engine-surface markdown-engine">
      <article className="markdown-rendered">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
      </article>
    </div>
  );
}
