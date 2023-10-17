import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useContext, useState } from 'react';
import { AppGlobalContext } from 'renderer/GlobalContext';
import Settings from './Settings';
import Alert from './Alert';

async function hasValidOpenAIAPIKey() {
  const apiKey = (await window.books.getOpenAIApiKey()) as string | null;
  console.log('checking api key');
  console.log(apiKey);
  if (!apiKey) {
    return false;
  }
  // checking if key is valid
  return window.books.validateOpenAIKey(apiKey);
}

export default function MyModal() {
  const context = useContext(AppGlobalContext);
  const [message, setMessage] = useState<string>('');

  if (!context) {
    throw new Error('App must be used within a GlobalProvider');
  }

  const closeModal = async () => {
    if (!(await hasValidOpenAIAPIKey())) {
      setMessage('OpenAI API key is not valid');
      return;
    }
    setMessage('');
    context.setShowSettings(false);
    // checking if it's valid before closing the window
  };

  return (
    <Transition appear show={context.showSettings} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Settings
                </Dialog.Title>

                <div className="mt-8">
                  {message !== '' && <Alert message={message} />}
                  <Settings />
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
