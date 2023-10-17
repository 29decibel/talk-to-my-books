import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

// upload component to let user upload a file to the server
export default function Upload() {
  const navigator = useNavigate();

  const [indexing, setIndexing] = useState(false);

  // Prevent the default behavior of drag and drop events
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Add or remove a highlight class for dragover and dragleave events
  const highlight = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('border-blue-500');
  };
  const unhighlight = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500');
  };

  // Handle the drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    indexingBooks(convertFileListToArray(files));
  };

  const convertFileListToArray = (list: FileList) => {
    const array: string[] = [];
    for (let i = 0; i < list.length; i += 1) {
      if (
        list[i].type === 'application/pdf' ||
        list[i].name.endsWith('.epub')
      ) {
        array.push(list[i].path);
      }
    }
    return array;
  };

  const chooseFile = async () => {
    const files = (await window.fileHandler.openFile()) as string[];
    await indexingBooks(files);
  };

  async function indexingBooks(files: string[]) {
    const firstFile = files[0];
    if (!firstFile) {
      return;
    }

    setIndexing(true);
    const dataDocument = await window.books.createBook(firstFile);
    setIndexing(false);

    navigator(`/book/${dataDocument.id}`);
  }

  return (
    <div className="flex flex-grow">
      <div
        onDragEnter={(e) => {
          highlight(e);
          preventDefaults(e);
        }}
        onDragLeave={(e) => {
          unhighlight(e);
          preventDefaults(e);
        }}
        onDragOver={preventDefaults}
        onDrop={(e) => {
          unhighlight(e);
          handleDrop(e);
          preventDefaults(e);
        }}
        className="flex flex-col border-dashed border-4 m-10 items-center justify-center flex-1 rounded-lg space-y-4"
      >
        <p>Drag & drop pdf/epub to import</p>
        {indexing && <Spinner />}
        <button
          disabled={indexing}
          title="Select file"
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          type="button"
          onClick={chooseFile}
        >
          Select a PDF or EPUB file
        </button>
      </div>
    </div>
  );
}
