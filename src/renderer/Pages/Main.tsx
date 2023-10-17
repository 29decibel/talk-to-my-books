import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import '../App.css';
import { useContext, useEffect } from 'react';
import { AppGlobalContext } from 'renderer/GlobalContext';

import BookDetails from '../components/BookDetails';
import Settings from '../components/Settings';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Home from '../components/Home';
import Upload from '../components/Upload';
import Search from '../components/Search';
import MyModal from '../components/Dialog';

async function hasValidAPIKey() {
  const apiKey = await window.books.getOpenAIApiKey();
  if (!apiKey) {
    return false;
  }
  return window.books.validateOpenAIKey(apiKey);
}

export default function Main() {
  const context = useContext(AppGlobalContext);

  if (!context) {
    throw new Error('App must be used within a GlobalProvider');
  }

  useEffect(() => {
    // here we check the api key
    hasValidAPIKey()
      .then((result) => {
        if (!result) {
          context.setShowSettings(true);
        }
        return result;
      })
      .catch(() => {
        // something wrong
        context.setShowSettings(true);
      });
  }, [context]);
  return (
    <Router>
      <div className="flex flex-col w-full h-full">
        {context.showSettings && <MyModal />}
        <Header />
        {/* <-- we do not want the main area to scroll at all --> */}
        <div className="flex h-full overflow-y-hidden">
          <Sidebar />
          <div className="flex flex-grow p-4 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
