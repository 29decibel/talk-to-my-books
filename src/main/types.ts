export interface Book {
  id: string;
  title: string;
  coverImageUrl: string;
  author: string;
  synopsis: string;
}

export interface SourceDocument {
  pageContent: string;
  metadata: {
    source: string;
    pdf: {
      totalPages: number;
    };
    loc: {
      lines: {
        from: number;
        to: number;
      };
      pageNumber: number;
    };
  };
}

export interface Question {
  question: string;
  response: {
    text: string;
    sourceDocuments: SourceDocument[];
  };
  bookIds?: string[];
}

export interface DataDocument {
  title: string;
  id: string;
}
