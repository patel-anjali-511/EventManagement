import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  DollarSign,
  Activity,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/events/stats");
        setStats(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch dashboard stats",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-neutral-900 mb-4" />
        <p className="text-neutral-500 font-medium font-sans">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 flex items-center gap-4">
          <AlertCircle size={24} />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalIncome.toLocaleString()}`,
      icon: <DollarSign className="text-neutral-900" size={18} />,
      label: "All time earnings",
    },
    {
      title: "Live Events",
      value: stats.totalLiveEvents,
      icon: <Activity className="text-neutral-900" size={18} />,
      label: "Happening today",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: <Calendar className="text-neutral-900" size={18} />,
      label: "Platform total",
    },
    {
      title: "Registrations",
      value: stats.totalRegistrations.toLocaleString(),
      icon: <Users className="text-neutral-900" size={18} />,
      label: "Across all events",
    },
    {
      title: "Attendance",
      value: `${stats.attendancePercentage}%`,
      icon: <CheckCircle2 className="text-neutral-900" size={18} />,
      label: "Average rate",
    },
  ];

  return (
    <div className="p-6 lg:p-10 font-sans space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Real-time platform metrics and event performance.
          </p>
        </div>
        <Link
          to="/admin/events/new"
          className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all active:scale-95 flex items-center gap-2"
        >
          Add Event
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg border border-neutral-100 shadow-none space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                {card.title}
              </span>
              <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900">
                {card.value}
              </h3>
              <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-tight">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border border-neutral-100 shadow-none overflow-hidden flex flex-col h-[450px]">
          <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/20">
            <h2 className="text-[11px] font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-widest">
              <Calendar size={14} className="text-neutral-400" />
              Upcoming Events
            </h2>
            <Link
              to="/admin/events"
              className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase tracking-wider"
            >
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {stats.upcomingEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 text-xs italic">
                No upcoming events
              </div>
            ) : (
              <div className="space-y-1">
                {stats.upcomingEvents.map((event) => (
                  <Link
                    key={event._id}
                    to={`/admin/events/${event._id}`}
                    className="p-4 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-900 group-hover:text-black">
                        {event.title}
                      </span>
                      <span className="text-xs text-neutral-400 mt-1">
                        {new Date(event.date).toLocaleDateString()} •{" "}
                        {event.location}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-neutral-900">
                        {event.registrationCount} / {event.capacity}
                      </span>
                      <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-tighter">
                        Seats
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Events */}
        <div className="bg-white rounded-lg border border-neutral-100 shadow-none overflow-hidden flex flex-col h-[450px]">
          <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/20">
            <h2 className="text-[11px] font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-widest">
              <Clock size={14} className="text-neutral-400" />
              Past Events
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {stats.pastEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-neutral-400 text-xs italic">
                No past events recorded
              </div>
            ) : (
              <div className="space-y-1">
                {stats.pastEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-900">
                        {event.title}
                      </span>
                      <span className="text-xs text-neutral-400 mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-neutral-900">
                        ₹
                        {(
                          event.registrationCount * event.price
                        ).toLocaleString()}
                      </span>
                      <p className="text-[10px] uppercase text-neutral-400 font-bold tracking-tighter">
                        Revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-lg border border-neutral-100 shadow-none space-y-8">
          <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest">
            Revenue per Event (Top 10)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f5f5f5"
                />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <Tooltip
                  cursor={{ fill: "#fafafa" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#171717"
                  radius={[2, 2, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-white p-8 rounded-lg border border-neutral-100 shadow-none space-y-8">
          <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest">
            Attendance Rate (%)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.attendanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f5f5f5"
                />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#171717"
                  strokeWidth={2.5}
                  dot={{
                    stroke: "#171717",
                    strokeWidth: 2,
                    r: 3,
                    fill: "#fff",
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
