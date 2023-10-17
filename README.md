## Talk to my books

![talk-to-my-book](./screenshots/talk-to-book.avif)

![talk-to-multiple-books](./screenshots/talk-to-multiple-books.avif)

There are lots of talk to your pdf services out there. But I really want one which I know where the data goes to.

So I built this desktop app which users your own OpenAI API key. Storing the embeddings and questions all locally in plain (JSON) files.


### Key ideas

- Local first approach. Browse previous questions and answers locally. (Indexing and asking question still depends on OpenAI, hopefully can do entire local approach later on)
- Better privacy - I don't want the pdf/epubs leaving my device. Because we still need to create OpenAI embeddings, so only the first time indexing/embeddings will send content to OpenAI.
- Using my own OpenAI API key. There is no 3rd party service/server involved. So the imported pdf/epub got saved directly on your device, the created indexes also stored on the device after first indexing (through OpenAI API)
- Question to multiple books.
- All the questions and answers stored on the device. It's easy to export.

As this is still in beta mode, there are features like exports or other LLMs planning to supported in the future.

### Future features

Features building in progress:
- showing source documents metadata and browsing pdf directly on the app
- export all the question and answers in markdown format
- Save questions / answers
- Search all previous questions
- Customized prompt for the question

### Build
```
pnpm i
```

```
pnpm start
```

```bash
pnpm package
```

### Credits
- [faiss](https://github.com/facebookresearch/faiss)
- [faiss-node](https://github.com/ewfian/faiss-node)
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
