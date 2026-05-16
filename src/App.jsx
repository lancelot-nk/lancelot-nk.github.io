import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import Home from './pages/Home';
import DAWPage from './pages/DAWPage';
import PageNotFound from './pages/PageNotFound';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          {/* Main Entry Point */}
          <Route path="/" element={<Home />} />
          {/* Alpha DAW fullscreen page */}
          <Route path="/daw" element={<DAWPage />} />
          <Route path="*" element={<Home />} /> 
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;