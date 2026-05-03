import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ShieldCheck,
  Users,
  LogOut,
  CheckSquare,
  Scan,
  DollarSign,
  KeyRound,
} from "lucide-react";

const ALL_NAV_ITEMS = [
  {
    path: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard",
    permission: "dashboard",
  },
  {
    path: "/admin/events",
    icon: Calendar,
    label: "Events",
    permission: "events",
  },
  {
    path: "/admin/scanner",
    icon: Scan,
    label: "Scanner",
    permission: "scanner",
  },
  {
    path: "/admin/payments",
    icon: DollarSign,
    label: "Payments",
    permission: "payments",
  },
  { path: "/admin/users", icon: Users, label: "Users", permission: "users" },
  {
    path: "/admin/admins",
    icon: ShieldCheck,
    label: "Admins",
    permission: "admins",
  },
  { path: "/admin/roles", icon: KeyRound, label: "Roles", permission: "roles" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const permissions = userInfo?.permissions;

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!permissions) return true;
    return permissions.includes(item.permission);
  });

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/admin/login");
  };

  return (
    <div className="w-64 bg-white border-r border-neutral-100 h-screen flex flex-col fixed top-0 left-0 z-20 font-sans">
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center">
          <CheckSquare className="text-white w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          EventNest
        </h1>
      </div>

      <div className="px-6 mb-4">
        <div className="h-px bg-neutral-100 w-full"></div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-400 group-hover:text-neutral-600"
                }
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        {userInfo?.roleName && (
          <div className="mb-3 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-100">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Role
            </p>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">
              {userInfo.roleName}
            </p>
          </div>
        )}
        <div className="bg-neutral-50 rounded-2xl p-1 border border-neutral-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full space-x-2 text-neutral-600 p-3 hover:bg-white hover:text-red-500 rounded-lg transition-all font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
