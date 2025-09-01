import '../src/styles/globals.scss';
import { Suspense } from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
} from "react-router-dom";
import ErrorPage from "./routes/errorPage";
import Home from "./routes/home";
import VeraPage from "./routes/vera";
import BernardPage from './routes/bernard';
import EtiennePage from './routes/etienne';
import TheodorePage from './routes/theodore';

function App() {
  return (
        <Router>
            <Suspense fallback="...loading">
                <Routes>
                  <Route path="/vera" element={<VeraPage />} />
                  <Route path="/bernard" element={<BernardPage />} />
                  <Route path="/etienne" element={<EtiennePage />} />
                  <Route path="/theodore" element={<TheodorePage />} />

                  {/* Catch-all route for unknown paths */}
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
