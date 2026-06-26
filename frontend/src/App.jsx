import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventForm from "./pages/EventForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Admins from "./pages/Admins";
import Users from "./pages/Users";
import EventAttendees from "./pages/EventAttendees";
import MyEvents from "./pages/MyEvents";
import TicketView from "./pages/TicketView";
import Payments from "./pages/Payments";
import QRScanner from "./pages/Scanner";
import Roles from "./pages/Roles";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import AdminLayout from "./layouts/AdminLayout";
import FrontendLayout from "./layouts/FrontendLayout";

const AdminRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || !userInfo.token || userInfo.role !== "admin")
    return <Navigate to="/admin/login" replace />;
  return children;
};

const PAGE_PATHS = {
  dashboard: "/admin",
  events: "/admin/events",
  scanner: "/admin/scanner",
  payments: "/admin/payments",
  users: "/admin/users",
  admins: "/admin/admins",
  roles: "/admin/roles",
};

const PermissionRoute = ({ permission, children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const permissions = userInfo?.permissions;

  if (!permissions) return children;

  if (permissions.includes(permission)) return children;

  const fallback = permissions.length > 0 ? PAGE_PATHS[permissions[0]] : "/admin/login";
  return <Navigate to={fallback} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Frontend Routes */}
        <Route element={<FrontendLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/ticket/:id" element={<TicketView />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Login Route (Outside AdminRoute protection) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<PermissionRoute permission="dashboard"><AdminDashboard /></PermissionRoute>} />
          <Route path="events" element={<PermissionRoute permission="events"><Events /></PermissionRoute>} />
          <Route path="events/new" element={<PermissionRoute permission="events"><EventForm /></PermissionRoute>} />
          <Route path="events/edit/:id" element={<PermissionRoute permission="events"><EventForm /></PermissionRoute>} />
          <Route path="events/:id/attendees" element={<PermissionRoute permission="events"><EventAttendees /></PermissionRoute>} />
          <Route path="scanner" element={<PermissionRoute permission="scanner"><QRScanner /></PermissionRoute>} />
          <Route path="admins" element={<PermissionRoute permission="admins"><Admins /></PermissionRoute>} />
          <Route path="users" element={<PermissionRoute permission="users"><Users /></PermissionRoute>} />
          <Route path="payments" element={<PermissionRoute permission="payments"><Payments /></PermissionRoute>} />
          <Route path="roles" element={<PermissionRoute permission="roles"><Roles /></PermissionRoute>} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
