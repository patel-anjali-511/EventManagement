import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import api from "../api/axios";
import { DataTable } from "@/components/ui/data-table";

const IMAGE_BASE_URL = "http://localhost:4000";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/events?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`,
      );
      setEvents(data.events);
      setTotalItems(data.total);
      setPageCount(data.pages);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/events/${id}`);
        setSuccessMessage("Event deleted successfully!");
        fetchEvents();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Failed to delete event", error);
      }
    }
  };

  const columns = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/events/${row.original._id}/attendees`}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 border border-neutral-50 transition-colors"
            title="Attendees"
          >
            <Users size={14} />
          </Link>
          <Link
            to={`/admin/events/edit/${row.original._id}`}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-900 border border-neutral-50 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </Link>
          <button
            onClick={() => handleDelete(row.original._id)}
            className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg border border-neutral-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Event",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-100/50 shrink-0">
            {row.original.image ? (
              <img
                src={`${IMAGE_BASE_URL}${row.original.image}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="text-neutral-300" size={16} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 text-sm leading-tight">
              {row.original.title}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[200px]">
              {row.original.shortDescription}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center text-neutral-500 text-sm">
          <MapPin size={14} className="mr-2 text-neutral-300" />
          <span className="truncate max-w-[150px]">
            {row.original.location}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center text-neutral-500 text-sm">
          <Calendar size={14} className="mr-2 text-neutral-300" />
          {new Date(row.original.date).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Ticket",
      cell: ({ row }) => (
        <div className="font-bold text-neutral-900 text-sm">
          {row.original.price > 0 ? (
            `₹${row.original.price}`
          ) : (
            <span className="text-green-600">Free</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => (
        <div className="text-neutral-500 text-sm font-medium">
          {row.original.registrationCount || 0} / {row.original.capacity}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 font-sans space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Event Management
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create, update and track all your organization events.
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {loading && !events.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">
            Loading events...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={events}
          searchKey="title"
          placeholder="Filter events..."
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

export default Events;
