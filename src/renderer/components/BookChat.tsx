// a component allow user to chat with their book
// it has a input box and list of questions asked before

import { ChainAnswerResult } from 'main/data';
import { Question } from 'main/types';
import { useEffect, useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import log from 'electron-log';
import QuestionForm from './QuestionForm';
import Spinner from './Spinner';
import Tag from './Tag';
import { Source } from 'graphql';
import SourceDocumentCard from './SourceDocumentCard';
import SourceDocumentsPanel from './SourceDocumentsPanel';

export interface BookChatProps {
  id: string;
}

export default function BookChat(props: BookChatProps) {
  const { id } = props;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    log.info('BookCard details rendered');
    window.books
      .pastQuestionsToBook(id || '')
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
  }, [id]);

  const sendQuestion = async (text: string) => {
    setAsking(true);
    // here we send question to the main process and get the response there
    const result = (await window.books.questionToMyBook(
      id,
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

  return (
    <div className="flex flex-col p-4 max-w-2xl flex-1">
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

            <SourceDocumentsPanel
              openBook={() => {
                window.fileHandler.openPDF(id);
              }}
              sourceDocuments={question.response.sourceDocuments}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
