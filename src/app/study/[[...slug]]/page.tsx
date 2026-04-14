'use client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LegacyStudyPage from '../../../legacy-pages/Study/StudyPage';

export default function StudyRoutePage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/study" element={<LegacyStudyPage />} />
        <Route path="/study/:id" element={<LegacyStudyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
