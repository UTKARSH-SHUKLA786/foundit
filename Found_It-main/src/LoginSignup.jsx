import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginSignup() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const hasAlphabet = /[a-zA-Z]/.test(collegeId);
    if (!hasAlphabet) {
      alert("College ID must contain at least one letter!");
      return false;
    }
    if (!isLogin || isForgotMode) {
      const hasNum = /\d/.test(password);
      const hasLetter = /[a-zA-Z]/.test(password);
      if (!hasNum || !hasLetter) {
        alert("Password must contain both letters and numbers!");
        return false;
      }
    }
    return true;
  };

  // --- Handle Forgot Password (Initial OTP Send) ---
  const handleForgotRequest = async () => {
    if (!email || !collegeId) return alert("Please enter College ID and Email!");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("Reset OTP sent to your email!");
        setIsOtpSent(true);
      } else {
        alert("Failed to send reset OTP.");
      }
    } catch (err) {
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Verify & Password Reset ---
  const handleVerifyAndAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const verifyRes = await fetch(`http://localhost:8080/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (verifyRes.ok) {
        if (isForgotMode) {
          const resetRes = await fetch(`http://localhost:8080/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collegeId, newPassword: password }),
          });
          if (resetRes.ok) {
            alert("Password updated! Please login.");
            setIsForgotMode(false);
            setIsOtpSent(false);
            setIsLogin(true);
            setPassword(""); // Clear password field
          }
        } else {
          alert("Email Verified! You can now login.");
          setIsOtpSent(false);
          setIsLogin(true);
        }
      } else {
        alert("Invalid OTP!");
      }
    } catch (error) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  // --- Main Auth Logic ---
  const handleAuth = async (e) => {
    e.preventDefault();

    // FIXED: Agar forgot mode hai toh auth nahi, forgot request chalao
    if (isForgotMode) {
      handleForgotRequest();
      return;
    }

    if (!validateInputs()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`http://localhost:8080/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("collegeId", collegeId);
          navigate("/");
        } else {
          alert(data.message);
        }
      } else {
        // SIGNUP
        const signupRes = await fetch(`http://localhost:8080/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, password, email }),
        });

        if (signupRes.ok) {
          const otpRes = await fetch(`http://localhost:8080/api/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (otpRes.ok) {
            alert("OTP sent for verification!");
            setIsOtpSent(true);
          }
        } else {
          const data = await signupRes.json();
          alert(data.message);
        }
      }
    } catch (error) {
      alert("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
      <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
        FOUND-IT
      </h1>

      <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isOtpSent ? "Verify OTP" : isForgotMode ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
        </h2>

        {isOtpSent ? (
          <form className="flex flex-col gap-4" onSubmit={handleVerifyAndAction}>
            <p className="text-gray-400 text-sm">Enter OTP sent to {email}</p>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-center text-2xl"
              required
            />
            <button className="bg-cyan-500 text-white py-3 rounded-xl font-bold">
              {loading ? "Processing..." : "Verify & Complete"}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="College ID"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white"
              required
            />
            {( !isLogin || isForgotMode ) && (
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white"
                required
              />
            )}
            <input
              type="password"
              placeholder={isForgotMode ? "New Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white"
              required
            />
            
            {isLogin && !isForgotMode && (
              <p className="text-right text-xs text-cyan-400 cursor-pointer underline" onClick={() => setIsForgotMode(true)}>
                Forgot Password?
              </p>
            )}

            <button type="submit" className="bg-white text-black py-3 rounded-xl font-bold mt-2">
              {loading ? "..." : isForgotMode ? "Send Reset OTP" : isLogin ? "Sign In" : "Register"}
            </button>
            
            {isForgotMode && (
              <button type="button" className="text-xs text-gray-400 mt-2" onClick={() => setIsForgotMode(false)}>
                Back to Login
              </button>
            )}
          </form>
        )}

        {!isOtpSent && !isForgotMode && (
          <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? "New user?" : "Have an account?"}{" "}
            <span className="text-white font-bold cursor-pointer underline" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginSignup;