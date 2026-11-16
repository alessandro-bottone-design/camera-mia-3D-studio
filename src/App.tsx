import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppNavbar } from './components/layout/AppNavbar';
import { OverviewPage } from './pages/OverviewPage';
import { StudioPage } from './pages/StudioPage';
import { WardrobesPage } from './pages/WardrobesPage';
import { SurveyGalleryPage } from './pages/SurveyGalleryPage';
import { DocsPage } from './pages/DocsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-normal antialiased">
        <AppNavbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/armadi" element={<WardrobesPage />} />
            <Route path="/rilievo" element={<SurveyGalleryPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
