import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

const EventAttendees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchEvent = useCallback(async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      console.error("Failed to fetch event", err);
    }
  }, [id]);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/registrations/${id}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`,
      );
      setRegistrations(data.registrations);
      setTotalItems(data.total);
      setPageCount(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendees");
    } finally {
      setLoading(false);
    }
  }, [id, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
  }, [fetchEvent, fetchRegistrations]);

  const columns = [
    {
      id: "actions",
      header: "Status",
      cell: ({ row }) => (
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            row.original.attended
              ? "text-indigo-600 bg-indigo-50 border-indigo-100"
              : "text-neutral-400 bg-neutral-50 border-neutral-100"
          }`}
        >
          {row.original.attended ? "Attended" : "Pending"}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Attendee",
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
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <div
          className={`text-[10px] font-bold uppercase ${row.original.paymentStatus === "Completed" ? "text-green-600" : "text-amber-600"}`}
        >
          {row.original.paymentStatus}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => (
        <span className="text-neutral-400 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 font-sans space-y-8">
      <div className="space-y-4">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center text-neutral-400 hover:text-neutral-900 text-xs font-bold uppercase tracking-widest transition-colors mb-2"
        >
          <ArrowLeft size={14} className="mr-2" />
          Back to Events
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Event Attendees
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Guest list and verification for{" "}
              <span className="font-bold text-neutral-900">{event?.title}</span>
            </p>
          </div>
          <div className="bg-white border border-neutral-100 px-4 py-2 rounded-lg text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-widest">
              Attendance Rate
            </span>
            <span className="text-lg font-bold text-neutral-900">
              {registrations.filter((r) => r.attended).length} / {totalItems}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {loading && !registrations.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">
            Gathering guest list...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={registrations}
          searchKey="name"
          placeholder="Filter attendees..."
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

export default EventAttendees;
