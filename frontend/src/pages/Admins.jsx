import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { DataTable } from "@/components/ui/data-table";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/auth/admins?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`
      );
      setAdmins(data.admins);
      setTotalItems(data.total);
      setPageCount(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await api.get("/roles");
      setRoles(data);
    } catch {
      // roles are optional; silently fail
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenModal = (mode, admin = null) => {
    setModalMode(mode);
    setSelectedAdmin(admin);
    if (mode === "edit" && admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        password: "",
        roleId: admin.roleId?._id || "",
      });
    } else {
      setFormData({ name: "", email: "", password: "", roleId: "" });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", email: "", password: "", roleId: "" });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      roleId: formData.roleId || null,
    };
    try {
      if (modalMode === "add") {
        await api.post("/auth/admin", payload);
        setSuccessMessage("Admin created successfully!");
      } else {
        await api.put(`/auth/admin/${selectedAdmin._id}`, payload);
        setSuccessMessage("Admin updated successfully!");
      }
      fetchAdmins();
      handleCloseModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await api.delete(`/auth/admin/${id}`);
        setSuccessMessage("Admin deleted successfully!");
        fetchAdmins();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete admin");
      }
    }
  };

  const columns = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal("edit", row.original)}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 border border-neutral-50 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.original._id)}
            className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg border border-neutral-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-[9px]">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-neutral-900 text-sm">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-neutral-500 text-sm font-medium">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "roleId",
      header: "Access Role",
      cell: ({ row }) => {
        const assignedRole = row.original.roleId;
        return assignedRole ? (
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-900 text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-200">
            {assignedRole.name}
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            Superadmin
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-neutral-400 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 font-sans space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Administrators
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage your team access and permissions.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {loading && !admins.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">
            Loading records...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          searchKey="name"
          placeholder="Filter by name..."
          manualPagination={true}
          pageCount={pageCount}
          paginationState={pagination}
          onPaginationChange={setPagination}
          totalItems={totalItems}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl border border-neutral-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900">
                  {modalMode === "add" ? "New Admin" : "Edit Admin"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-neutral-50 rounded-full text-neutral-400"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    {modalMode === "add" ? "Password" : "New Password"}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "add"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    Access Role
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200 text-neutral-700"
                  >
                    <option value="">Superadmin (full access)</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
