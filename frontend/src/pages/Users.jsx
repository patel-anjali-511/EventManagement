import React, { useState, useEffect, useCallback } from "react";
import { Mail, Loader2, ShieldAlert } from "lucide-react";
import api from "../api/axios";
import { DataTable } from "@/components/ui/data-table";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/auth/customers?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`,
      );
      setUsers(data.customers);
      setTotalItems(data.total);
      setPageCount(data.pages);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users list");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-neutral-300">
            No Actions
          </span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center font-bold text-[9px] text-neutral-400">
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
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <Mail size={14} className="text-neutral-300" />
          <span>{row.original.email}</span>
        </div>
      ),
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
            Customers
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage and view all registered platform users.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2">
          <ShieldAlert size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {loading && !users.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">
            Loading user database...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          placeholder="Filter by name..."
          manualPagination={true}
          pageCount={pageCount}
          paginationState={pagination}
          onPaginationChange={setPagination}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default Users;
