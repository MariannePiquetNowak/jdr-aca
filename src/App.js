import '../src/styles/globals.scss';
import { Suspense } from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route,
    useLocation
} from "react-router-dom";
import ErrorPage from "./routes/errorPage";
import Home from "./routes/home";
import VeraPage from "./routes/vera";
import BernardPage from './routes/bernard';
import EtiennePage from './routes/etienne';
import TheodorePage from './routes/theodore';
import ArmandPage from './routes/armand';
import ValentinePage from './routes/valentine';
import StephanePage from './routes/stephane';
import MJPage from './routes/MJ';
import Header from './layouts/Header';

function AppContent() {
    const location = useLocation();
    // show Header only on MJ-like paths (/MJ, /MJ/, /mj/whatever)
    const showHeader = location && location.pathname && location.pathname.toLowerCase().startsWith('/mj');

    return (
                        <>
                        {showHeader && <Header />}
                        <Suspense fallback="...loading">
                                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/vera" element={<VeraPage />} />
                  <Route path="/bernard" element={<BernardPage />} />
                  <Route path="/etienne" element={<EtiennePage />} />
                  <Route path="/theodore" element={<TheodorePage />} />
                  <Route path="/armand" element={<ArmandPage />} />
                  <Route path="/valentine" element={<ValentinePage />} />
                  <Route path="/stephane" element={<StephanePage />} />
                  <Route path="/MJ" element={<MJPage />} />
                  {/* Catch-all route for unknown paths */}
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
