import { useEffect, useState } from 'react';

import log from 'electron-log';

export default function Settings() {
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('');
  useEffect(() => {
    window.books
      .getOpenAIApiKey()
      .then((key) => {
        log.info(key);
        setOpenAIApiKey(key);
        return key;
      })
      .catch((err) => {
        log.error(err);
      });
  }, []);

  const [userIndexFolder, setUserIndexFolder] = useState<string>('');
  // loading the user folder
  useEffect(() => {
    window.books
      .getUserIndexFolder()
      .then((folder) => {
        log.info(folder);
        setUserIndexFolder(folder);
        return folder;
      })
      .catch((err) => {
        log.info('oh non....');
        log.error(err);
      });
  }, []);
  // here we load the api key
  return (
    <div className="flex flex-col flex-1">
      <form className="flex flex-col max-w-3xl">
        <label htmlFor="api-key-input">OpenAI API key</label>
        <input
          type="text"
          id="api-key-input"
          value={openAIApiKey}
          onChange={async (e) => {
            setOpenAIApiKey(e.target.value);
            console.log('setting api key');
            await window.books.saveOpenAIApiKey(e.target.value);
          }}
          className="px-2 mr-3 text-gray-800 border rounded-sm w-full my-2"
          placeholder="OpenAI API KEY"
        />
      </form>
      <form className="flex flex-col my-4 max-w-3xl">
        <label htmlFor="api-key">Library folder</label>
        <input
          type="text"
          className="px-2 mr-3 text-gray-800 border rounded-sm w-full my-2"
          name="index folder"
          readOnly
          id=""
          value={userIndexFolder}
        />
        <button
          type="button"
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 flex-shrink-0"
          onClick={async (e) => {
            e.preventDefault();
            const folder = await window.fileHandler.selectFolder();
            if (folder) {
              await window.books.setUserIndexFolder(folder);
              setUserIndexFolder(folder);
            }
            //
          }}
        >
          Select folder
        </button>
      </form>
    </div>
  );
}
