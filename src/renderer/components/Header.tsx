import React from 'react';
import log from 'electron-log';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigator = useNavigate();
  return (
    <div className="dragable-bar h-10 flex ">
      <div className="w-58 w-56 bg-gray-50 pl-20 py-1">
        <button
          type="button"
          onClick={() => {
            log.info('clicked');
            console.log('clicked');
          }}
          className="w-8 h-8 hover:bg-gray-100 no-drag flex items-center justify-center rounded-lg cursor-default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
      <div className="flex-grow flex py-2 justify-end px-2">
        <button
          type="button"
          className="w-8 h-8 hover:bg-gray-50 no-drag flex items-center justify-center rounded-lg cursor-default"
          onClick={() => navigator('/search')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
