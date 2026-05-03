import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex bg-neutral-50 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 h-screen flex flex-col overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
