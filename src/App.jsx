import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';

export type SectionKey = 
  | 'projects' 
  | 'resume' 
  | 'dashboards' 
  | 'design' 
  | 'publications' 
  | 'certifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;