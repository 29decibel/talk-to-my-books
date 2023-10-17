import './App.css';

import Main from './Pages/Main';
import { GlobalProvider } from './GlobalContext';

export default function App() {
  return (
    <GlobalProvider>
      <Main />
    </GlobalProvider>
  );
}
