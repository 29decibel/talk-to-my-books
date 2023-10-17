import { SourceDocument } from 'main/types';

export interface SourceDocumentCardProps {
  sourceDocument: SourceDocument;
  openBook: (sourceDocument: SourceDocument) => void;
}
export default function SourceDocumentCard(prop: SourceDocumentCardProps) {
  const { sourceDocument, openBook } = prop;
  return (
    <div
      className="bg-gray-100 rounded-xl p-3 mt-4 flex-shrink-0"
      style={{
        width: 'calc(100% - 20px)',
      }}
    >
      <p>{sourceDocument.pageContent}</p>

      <button
        className="flex items-center space-x-2 justify-center mt-2"
        title="Open original doc"
        onClick={() => {
          // here we open the orignal document
          console.log(
            'sourceDocument.metadata.source',
            sourceDocument.metadata.source
          );
          openBook(sourceDocument);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <span>Page: {sourceDocument.metadata.loc.pageNumber}</span>
      </button>
    </div>
  );
}
