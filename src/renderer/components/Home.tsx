import { useEffect, useState } from 'react';
import log from 'electron-log';

import { DataDocument } from 'main/types';
import Books from './Books';

export default function Home() {
  const [dataDocs, setDataDocs] = useState<DataDocument[]>([]);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    window.books
      .allBooks()
      .then((loadedBooks) => {
        setDataDocs(loadedBooks);
        return loadedBooks;
      })
      .catch((err) => {
        log.error('error loading books');
        log.error(err);
      });
  }, [dataDocs.length]);

  // Filtering logic
  const filteredDataDocs = dataDocs.filter((doc) => {
    // Assuming the 'title' field should be filtered
    return doc.title.toLowerCase().includes(filterText.toLowerCase());
  });
  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-mono">Your documents</h1>

      <input
        type="text"
        className="text-gray-700 px-2 mr-4 flex-1 border rounded-sm w-full my-4 py-1 min-w-full flex-grow-0"
        placeholder="Filter books ..."
        name="question"
        id=""
        value={filterText}
        onChange={(e) => {
          setFilterText(e.target.value);
        }}
      />

      {filteredDataDocs.length === 0 && <div className="">No books yet</div>}
      <Books dataDocuments={filteredDataDocs} />
    </div>
  );
}
