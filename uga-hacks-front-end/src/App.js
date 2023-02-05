import "./App.css";

import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./components/home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
