// list of books using ul and BookCard

import { DataDocument } from 'main/types';
import BookCard from './BookCard';

export interface BooksProps {
  dataDocuments: DataDocument[];
}

export default function Books(props: BooksProps) {
  const { dataDocuments } = props;

  return (
    <ul className="justify-left">
      {dataDocuments.map((book: DataDocument) => (
        <li key={book.id} className="my-4">
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
