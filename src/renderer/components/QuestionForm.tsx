// question form component

import { useState } from 'react';

export interface QuestionFormProps {
  sendQuestion: (questionText: string) => Promise<void>;
}

export default function QuestionForm(props: QuestionFormProps) {
  const { sendQuestion } = props;
  const [text, setText] = useState<string>('');
  const [asking, setAsking] = useState<boolean>(false);
  return (
    <form
      className="flex w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        setAsking(true);
        await sendQuestion(text);
        setAsking(false);
        setText('');
      }}
    >
      <input
        type="text"
        className="text-gray-700 px-2 mr-4 flex-1 border rounded-sm"
        placeholder="Ask your book a question ..."
        name="question"
        id=""
        value={text}
        disabled={asking}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <button
        type="button"
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        onClick={async () => {
          setAsking(true);
          await sendQuestion(text);
          setAsking(false);
          setText('');
        }}
        disabled={asking}
      >
        Submit
      </button>
    </form>
  );
}
