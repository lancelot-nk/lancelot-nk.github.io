import { useLocation, useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] text-white font-mono">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-[#E01880] opacity-80">404</h1>
          <div className="h-1 w-20 bg-[#E01880] mx-auto opacity-50"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-medium tracking-widest uppercase">
            Route Not Found
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            The path <span className="text-[#E01880]">"/{pageName}"</span> does not exist in this sector.
          </p>
        </div>
        
        <div className="pt-6">
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 border border-[#E01880] text-[#E01880] rounded-sm hover:bg-[#E01880] hover:text-white transition-all duration-300 uppercase text-xs tracking-widest"
          >
            Return to Core
          </button>
        </div>
      </div>
    </div>
  );
}