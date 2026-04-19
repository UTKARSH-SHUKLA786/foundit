import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function FormPage({ type }) {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("");
  const [objectType, setObjectType] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null); // 1. New state for the image file
  const [loading, setLoading] = useState(false);

  const categories = [
    "Electronics (Phone, Laptop)",
    "Identity (ID Card, Wallet)",
    "Keys",
    "Books/Stationery",
    "Clothing/Accessories",
    "Others"
  ];

  const title = type === "found" ? "Report Found Item" : "Report Lost Item";
  const themeColor = type === "found" ? "border-cyan-500/50" : "border-blue-500/50";
  const buttonColor = type === "found" ? "bg-cyan-500 hover:bg-cyan-400" : "bg-blue-500 hover:bg-blue-400";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!objectType) return alert("Please select an object type");
    
    setLoading(true);
    const collegeId = localStorage.getItem("collegeId");

    // 2. Use FormData to handle file upload
    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("objectType", objectType);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("contact", contact);
    formData.append("reportedBy", collegeId);
    
    if (image) {
      formData.append("image", image); // 3. Append the image file
    }

    try {
      const response = await fetch("http://localhost:8080/report", {
        method: "POST",
        // Note: Do NOT set "Content-Type" header when sending FormData
        body: formData, 
      });

      if (response.ok) {
        alert("Report submitted successfully!");
        navigate("/");
      } else {
        alert("Failed to submit report.");
      }
    } catch (error) {
      alert("Connection error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent text-white px-4">
      <button onClick={() => navigate("/")} className="absolute top-8 left-8 flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full font-semibold border border-white/10 active:scale-95">
        ← Back
      </button>

      <div className={`bg-gray-900/70 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border ${themeColor} animate-fadeUp`}>
        <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">{type === "found" ? "🔍" : "🎒"}</span>
            <h2 className="text-3xl font-bold tracking-tighter">{title}</h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          {/* ITEM NAME */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1">ITEM NAME</label>
            <input
                type="text"
                placeholder="e.g. iPhone 13, Nike Bag"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-white outline-none transition-all"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
            />
          </div>

          {/* OBJECT TYPE DROPDOWN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1">OBJECT TYPE</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-white outline-none transition-all appearance-none cursor-pointer"
                value={objectType}
                onChange={(e) => setObjectType(e.target.value)}
                required
              >
                <option value="" disabled className="bg-gray-900">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1">DESCRIPTION</label>
            <textarea
                placeholder="Details like color, place found/lost..."
                rows="2"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-white outline-none transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1">CONTACT INFO</label>
            <input
                type="text"
                placeholder="Phone No."
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-white outline-none transition-all"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
            />
          </div>

          {/* 4. IMAGE UPLOAD FIELD */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1">UPLOAD IMAGE</label>
            <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button type="submit" disabled={loading} className={`${buttonColor} text-black py-4 rounded-xl font-bold mt-2 transition-all active:scale-95 disabled:opacity-50`}>
            {loading ? "Processing..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormPage;
