// component that displays a book card

import { DataDocument } from 'main/types';
import { Link } from 'react-router-dom';

export interface BookCardProps {
  book: DataDocument;
}

export default function BookCard(props: BookCardProps) {
  const { book } = props;
  const { id, title } = book;

  return (
    <Link to={`/book/${id}`}>
      <div key={id} className="bg-white flex flex-col hover:underline">
        <div className="text-gray-800 w-full flex flex-col justify-between">
          {title}
        </div>
      </div>
    </Link>
  );
}
