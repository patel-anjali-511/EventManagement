import { Link, useNavigate } from "react-router-dom";
import { Star, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo && userInfo.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <nav className="border-b border-neutral-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
          <Star className="text-white w-4 h-4" />
        </div>
        <span className="text-xl font-bold tracking-tight text-neutral-900">
          EventNest
        </span>
      </Link>
      <div className="flex items-center gap-6">
        {userInfo ? (
          <>
            {!isAdmin && (
              <Link
                to="/my-events"
                className="text-neutral-600 font-bold hover:text-neutral-900 transition-colors"
              >
                My Registered Events
              </Link>
            )}
            {!isAdmin && (
              <Link
                to="/update-password"
                className="text-neutral-600 font-medium hover:text-neutral-900 transition-colors"
              >
                Update Password
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-neutral-600 font-medium hover:text-neutral-900 transition-colors"
              >
                <LayoutDashboard size={18} />
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-100 text-neutral-900 px-5 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-all active:scale-95"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-neutral-600 font-medium hover:text-neutral-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-neutral-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
