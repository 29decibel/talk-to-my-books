// a component allow user to chat with their book
// it has a input box and list of questions asked before

import { ChainAnswerResult } from 'main/data';
import { DataDocument, Question } from 'main/types';
import { useEffect, useRef, useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import log from 'electron-log';
// import { MentionsInput, Mention } from 'react-mentions';
import QuestionForm from './QuestionForm';
import Spinner from './Spinner';

type BookOptions =
  | OptionsOrGroups<
      {
        value: string;
        label: string;
      },
      GroupBase<{
        value: string;
        label: string;
      }>
    >
  | undefined;
export default function Search() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [asking, setAsking] = useState(false);
  const booksSelect = useRef(null);
  const [bookSelectOptions, setBookSelectOptions] = useState<BookOptions>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [allBooks, setBooks] = useState<DataDocument[]>([]);

  useEffect(() => {
    log.info('BookCard details rendered');
    window.books
      .pastQuestionsToBook()
      .then((pastQuestions) => {
        setQuestions(pastQuestions);
        log.info(pastQuestions);
        return pastQuestions;
      })
      .catch((err) => {
        log.error(err);
      });

    return () => {
      log.info('BookCard details unmounted');
    };
  }, []);

  const sendQuestion = async (text: string) => {
    setAsking(true);

    const idsToSearch = ids.length > 0 ? ids : allBooks.map((book) => book.id);

    // here we send question to the main process and get the response there
    const result = (await window.books.questionToMultipleBooks(
      idsToSearch,
      text
    )) as ChainAnswerResult;
    const newQuestions = [
      {
        question: text,
        response: {
          text: result.text,
          sourceDocuments: [],
        },
      },
      ...questions,
    ];
    setQuestions(newQuestions);
    setAsking(false);
  };

  // load all available books here
  useEffect(() => {
    window.books
      .allBooks()
      .then((books) => {
        setBooks(books);
        log.info(books);
        // let's update the book select options
        setBookSelectOptions(
          books.map((book) => ({
            value: book.id,
            label: book.title,
          }))
        );
        return books;
      })
      .catch((err) => {
        log.error(err);
      });
  }, []);

  return (
    <div className="flex flex-col p-4 max-w-2xl flex-1">
      <Select
        ref={booksSelect}
        isMulti
        options={bookSelectOptions}
        className="flex-grow-0 my-4"
        placeholder="Select a document to search ..."
        onChange={(selectedOptions) => {
          if (selectedOptions) {
            const values = selectedOptions.map((option) => option.value);
            setIds(values);
            log.info(values);
          } else {
            log.info('No options selected');
          }
        }}
      />

      <QuestionForm sendQuestion={sendQuestion} />
      {asking && (
        <div className="flex items-center justify-center mt-6">
          <Spinner />
        </div>
      )}

      <ul>
        {questions.map((question) => (
          <li key={question.question} className="my-6">
            <h2 className="font-semibold my-2 underline capitalize">
              {question.question}
            </h2>

            <div className="prose">
              <ReactMarkdown className="text-normal markdown-container">
                {question.response.text}
              </ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
