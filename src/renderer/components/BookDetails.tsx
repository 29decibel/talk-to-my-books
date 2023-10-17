import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import log from 'electron-log';
import BookChat from './BookChat';

export default function BookDetails() {
  const { id } = useParams();
  const [bookTitle, setBookTitle] = useState<string>('');
  // load book details here
  useEffect(() => {
    window.books
      .getBookDetails(id!)
      .then((book) => {
        log.info('book details loaded');
        if (book) {
          setBookTitle(book.title);
        }

        return book;
      })
      .catch((err) => {
        log.error('error loading book details');
        log.error(err);
      });
  }, [id]);

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="ml-4 text-lg">{bookTitle}</h1>
      <BookChat id={id || ''} />
    </div>
  );
}
