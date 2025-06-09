import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

<<<<<<< HEAD
import Home from './page/Home';
=======
import { Home, CreateBattle} from './page';
import { GlobalContextProvider } from './context';
>>>>>>> origin/master
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
=======
    <GlobalContextProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-battle" element={<CreateBattle />} />
      </Routes> 
    </GlobalContextProvider>
    
>>>>>>> origin/master
  </BrowserRouter>,
);
