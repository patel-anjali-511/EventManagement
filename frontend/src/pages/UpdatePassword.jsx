import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    setIsLoading(true);
    setError("");
    try {
      await api.put("/auth/updatepassword", { currentPassword, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 font-sans">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-sm border border-neutral-100 mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-5">
            <Lock className="w-6 h-6 text-neutral-800" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Update Password
          </h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Secure your account by updating your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-2xl text-sm mb-6 text-center">
            Password updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 ml-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none text-neutral-900 placeholder:text-neutral-400"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 ml-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none text-neutral-900 placeholder:text-neutral-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 ml-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none text-neutral-900 placeholder:text-neutral-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full mt-6 bg-neutral-900 text-white font-medium py-3.5 rounded-2xl hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-sm"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-neutral-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
