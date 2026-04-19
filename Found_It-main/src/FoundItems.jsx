import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null); // State for full-screen view
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("collegeId");

  const fetchItems = () => {
    fetch("http://localhost:8080/items/found")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const response = await fetch(`http://localhost:8080/items/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: currentUser }),
      });
      if (response.ok) {
        alert("Deleted!");
        fetchItems();
      }
    } catch (error) {
      alert("Error deleting item.");
    }
  };

  return (
    <div className="min-h-screen text-white p-8 relative">
      {/* --- ENLARGED IMAGE MODAL --- */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-10 right-10 text-white text-5xl font-light hover:text-cyan-400 transition-colors">&times;</button>
          <img 
            src={selectedImg} 
            alt="Enlarged" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(34,197,253,0.3)] border border-white/10 transition-transform scale-100"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <button onClick={() => navigate("/")} className="bg-white/10 px-6 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-all">
          ← Dashboard
        </button>
        <h1 className="text-4xl font-black text-cyan-400 uppercase tracking-tighter">Found Items 🔍</h1>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 p-6 rounded-3xl relative hover:border-cyan-500/50 transition-all flex flex-col">
            
            {item.reportedBy === currentUser && (
              <button onClick={() => handleDelete(item._id)} className="absolute top-4 right-4 z-20 text-white bg-red-500/80 px-3 py-1 rounded-lg hover:bg-red-600 text-[10px] font-bold backdrop-blur-sm transition-colors">
                DELETE
              </button>
            )}

            {/* IMAGE AREA */}
            <div 
              className={`w-full h-48 bg-black/40 rounded-2xl mb-4 overflow-hidden border border-white/5 flex items-center justify-center transition-all ${item.image ? 'cursor-zoom-in hover:brightness-110' : ''}`}
              onClick={() => item.image && setSelectedImg(`http://localhost:8080${item.image}`)}
            >
              {item.image ? (
                <img 
                  src={`http://localhost:8080${item.image}`} 
                  alt={item.itemName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center opacity-20">
                  <span className="text-4xl">📷</span>
                  <p className="text-[10px] mt-1 uppercase font-bold">No Image</p>
                </div>
              )}
            </div>

            <div className="mb-3 flex justify-between items-start">
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-bold uppercase border border-cyan-500/20">
                {item.objectType}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 truncate">{item.itemName}</h3>
            <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{item.description}</p>
            
            <div className="pt-4 border-t border-white/5 space-y-3 mt-auto">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] text-gray-500 uppercase font-bold block tracking-widest">Contact Person</span>
                  <p className="text-sm font-semibold text-cyan-100">{item.contact}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 uppercase font-bold block tracking-widest">Date</span>
                  <p className="text-[11px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <p className="text-[12px] text-gray-500">By: <span className="text-cyan-400/80 font-mono">{item.reportedBy}</span></p>
                {item.reportedBy === currentUser && (
                  <span className="text-[8px] bg-cyan-500 text-black px-2 py-1 rounded font-black uppercase tracking-tighter">Your Post</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoundItems;
