import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");

  useEffect(() => {
    const collegeId = localStorage.getItem("collegeId");
    if (!collegeId) {
      navigate("/login");
    } else {
      setUser(collegeId);
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("collegeId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* --- Navbar --- */}
      <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-cyan-500 rounded flex items-center justify-center font-bold text-black text-sm">L</div>
          <h1 className="text-lg font-bold tracking-tight">LOST & FOUND</h1>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-gray-400 text-base hidden md:block">
            Welcome, <span className="text-cyan-400 font-semibold">{user}</span>
          </span>
          <button
            onClick={handleSignOut}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-16 animate-slideDown">
          <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Recover What's Yours.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The central hub for our college community to report lost items and return found ones safely.
          </p>
        </header>

        {/* --- Action Grid --- */}
        <div className="grid md:grid-cols-2 gap-8 animate-fadeUp">
          
          {/* FOUND SECTION (CYAN) */}
          <div className="bg-gray-900 border border-white/5 p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">I Found Something</h3>
            <p className="text-gray-400 mb-8">Help someone find their lost item by reporting it here.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate("/report-found")}
                className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                Report Found Item
              </button>
              <button 
                onClick={() => navigate("/view-found")}
                className="w-full bg-white/5 text-cyan-400 border border-cyan-500/30 font-bold py-3 rounded-xl hover:bg-cyan-500/10 transition-all"
              >
                Browse Found Items
              </button>
            </div>
          </div>

          {/* LOST SECTION (BLUE) */}
          <div className="bg-gray-900 border border-white/5 p-8 rounded-3xl hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎒</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">I Lost Something</h3>
            <p className="text-gray-400 mb-8">Looking for your belongings? Post a report or search the list.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate("/report-lost")}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Report Lost Item
              </button>
              <button 
                onClick={() => navigate("/view-lost")}
                className="w-full bg-white/5 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-xl hover:bg-blue-500/10 transition-all"
              >
                Search Lost Items
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;
