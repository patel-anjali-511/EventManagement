import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import { DataTable } from "@/components/ui/data-table";

const ALL_PAGES = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Access to the main dashboard and analytics.",
  },
  {
    key: "events",
    label: "Events",
    description: "Manage events, categories, and registrations.",
  },
  {
    key: "scanner",
    label: "Scanner",
    description: "Access to QR code scanner for ticket validation.",
  },
  {
    key: "users",
    label: "Users",
    description: "View and manage registered customers.",
  },
  {
    key: "admins",
    label: "Admins",
    description: "Manage administrative users and team members.",
  },
  {
    key: "roles",
    label: "Roles",
    description: "Manage role-based access control and permissions.",
  },
  {
    key: "payments",
    label: "Payments",
    description: "View transaction history and payment reports.",
  },
];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/roles");
      setRoles(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenModal = (mode, role = null) => {
    setModalMode(mode);
    setSelectedRole(role);
    if (mode === "edit" && role) {
      setFormData({ name: role.name, permissions: role.permissions || [] });
    } else {
      setFormData({ name: "", permissions: [] });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", permissions: [] });
    setError(null);
  };

  const togglePermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (modalMode === "add") {
        await api.post("/roles", formData);
        setSuccessMessage("Role created successfully!");
      } else {
        await api.put(`/roles/${selectedRole._id}`, formData);
        setSuccessMessage("Role updated successfully!");
      }
      fetchRoles();
      handleCloseModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await api.delete(`/roles/${id}`);
        setSuccessMessage("Role deleted successfully!");
        fetchRoles();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete role");
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
      header: "Role Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center">
            <ShieldCheck size={13} />
          </div>
          <span className="font-bold text-neutral-900 text-sm">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Page Permissions",
      cell: ({ row }) => {
        const perms = row.original.permissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {perms.length === 0 ? (
              <span className="text-neutral-300 text-xs font-medium">No permissions</span>
            ) : (
              perms.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-200"
                >
                  {p}
                </span>
              ))
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
            Access Roles
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create and manage roles with page-level permissions.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Role
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {loading && !roles.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">Loading roles...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={roles}
          searchKey="name"
          placeholder="Filter by role name..."
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    {modalMode === "add" ? "Create New Role" : "Edit Role"}
                  </h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Set name and select page permissions.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-neutral-50 rounded-full text-neutral-400 mt-1"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    placeholder="e.g. Content Manager"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">
                    Page Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_PAGES.map((page) => {
                      const checked = formData.permissions.includes(page.key);
                      return (
                        <button
                          key={page.key}
                          type="button"
                          onClick={() => togglePermission(page.key)}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            checked
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-100 hover:border-neutral-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 text-sm leading-tight">
                                {page.label}
                              </p>
                              <p className="text-neutral-400 text-[11px] mt-0.5 leading-tight">
                                {page.description}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                checked
                                  ? "bg-neutral-900 border-neutral-900"
                                  : "border-neutral-300 bg-white"
                              }`}
                            >
                              {checked && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 border border-neutral-200 text-neutral-700 py-3 rounded-lg text-sm font-bold hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-neutral-900 text-white py-3 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : modalMode === "add" ? (
                      "Create Access Role"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
