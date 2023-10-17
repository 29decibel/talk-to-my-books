import { SourceDocument } from 'main/types';
import Tag from './Tag';
import SourceDocumentCard from './SourceDocumentCard';
import { useState } from 'react';

export interface SourceDocumentsPanelProps {
  sourceDocuments: SourceDocument[];
  openBook: (sourceDocument: SourceDocument) => void;
}
export default function SourceDocumentsPanel(prop: SourceDocumentsPanelProps) {
  const [showing, setShowing] = useState<boolean>(false);
  const [currentDocIndex, setCurrentDocIndex] = useState<number>(-1);
  const { sourceDocuments, openBook } = prop;
  return (
    <div>
      <div className="flex space-x-2">
        {sourceDocuments.map((doc, i) => (
          <Tag
            key={`tag-${i}`}
            name={doc.metadata.loc.pageNumber.toString()}
            data={doc}
            selected={i === currentDocIndex}
            onClick={() => {
              if (i === currentDocIndex) {
                setShowing(!showing);
              } else {
                setShowing(true);
                setCurrentDocIndex(i);
              }
            }}
          />
        ))}
      </div>
      {showing && (
        <div className="overflow-x-hidden">
          <div
            style={{
              transform: `translateX(calc(-${currentDocIndex * 100}% + ${
                currentDocIndex * 20
              }px))`,
            }}
            className="flex flex-grow flex-nowrap relative space-x-2 transition-transform"
          >
            {sourceDocuments.map((doc) => (
              <SourceDocumentCard sourceDocument={doc} openBook={openBook} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
