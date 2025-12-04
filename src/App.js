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
import MJAPage from './routes/MJA';
import MJJPage from './routes/MJJ';
import BestiairePage from './routes/bestiaire';
import ReglesPage from './routes/regles';
import JoueursPage from './routes/joueurs';
import PNJPage from './routes/pnj';
import LorePage from './routes/lore';
import ObjetsPage from './routes/objets';
import Header from './layouts/Header';

function AppContent() {
    const location = useLocation();
    // show Header on MJ and info pages (bestiaire, règles, joueurs, pnj, lore, objets)
    const mjPages = ['/mj', '/mja', '/mjj', '/bestiaire', '/regles', '/joueurs', '/pnj', '/lore', '/objets'];
    const showHeader = location && location.pathname && mjPages.some(page => location.pathname.toLowerCase().startsWith(page));

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
                  <Route path="/MJA" element={<MJAPage />} />
                  <Route path="/MJJ" element={<MJJPage />} />
                  <Route path="/bestiaire" element={<BestiairePage />} />
                  <Route path="/regles" element={<ReglesPage />} />
                  <Route path="/joueurs" element={<JoueursPage />} />
                  <Route path="/pnj" element={<PNJPage />} />
                  <Route path="/lore" element={<LorePage />} />
                  <Route path="/objets" element={<ObjetsPage />} />
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
