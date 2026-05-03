import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Ticket,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  Ban,
  Filter,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:4000";

const FILTERS = [
  { key: "All", label: "All", icon: Ticket },
  { key: "Past", label: "Past", icon: Clock },
  { key: "Attended", label: "Attended", icon: UserCheck },
  { key: "NotAttended", label: "Not Attended", icon: UserX },
  { key: "Cancelled", label: "Cancelled", icon: Ban },
];

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingRegistration, setCancellingRegistration] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const now = new Date();

  const fetchMyRegistrations = async () => {
    try {
      const { data } = await api.get("/registrations/my");
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch my registrations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const event = reg.event;
      if (!event) return false;
      const isPast = new Date(event.date) < now;
      switch (activeFilter) {
        case "Past":
          return isPast;
        case "Attended":
          return reg.attended === true;
        case "NotAttended":
          return reg.attended === false && reg.status !== "Cancelled";
        case "Cancelled":
          return reg.status === "Cancelled";
        default:
          return true;
      }
    });
  }, [registrations, activeFilter]);

  const handleCancelClick = (reg) => {
    setCancellingRegistration(reg);
  };

  const confirmCancelRegistration = async () => {
    if (!cancellingRegistration) return;

    setIsCancelling(true);
    try {
      await api.post(`/registrations/${cancellingRegistration._id}/cancel`);
      fetchMyRegistrations();
      setCancellingRegistration(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel registration");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
              My Registered Events
            </h1>
            <p className="text-neutral-500 mt-2 text-lg">
              Tracks and details for events you've signed up for.
            </p>
          </div>

          {!loading && registrations.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={14} className="text-neutral-400" />
              <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                {FILTERS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === key
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-neutral-100 rounded-2xl h-96"
              ></div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-24 bg-neutral-50 rounded-[10px] border border-dashed border-neutral-200">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-neutral-300 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              You haven't registered for any events yet
            </h3>
            <p className="text-neutral-500 mb-8">
              Discover amazing events on our home page and secure your spot!
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-neutral-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-900/10"
            >
              Browse Events
            </Link>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-[10px] border border-dashed border-neutral-200">
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              {(() => {
                const f = FILTERS.find((f) => f.key === activeFilter);
                const Icon = f?.icon || Calendar;
                return <Icon className="text-neutral-300 w-7 h-7" />;
              })()}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              No {activeFilter === "NotAttended" ? "not attended" : activeFilter.toLowerCase()} events
            </h3>
            <p className="text-neutral-400 text-sm">
              Try a different filter to see your events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRegistrations.map((reg) => {
              const event = reg.event;
              if (!event) return null;
              return (
                <div
                  key={reg._id}
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="group cursor-pointer bg-white rounded-[10px] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
                >
                  <div className="aspect-4/3 bg-[#f5f5f5] relative overflow-hidden">
                    {event.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-xl font-bold text-neutral-400/50 select-none text-center">
                        {event.title}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {reg.status === "Cancelled" ? (
                        <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <Ban size={13} />
                          Cancelled
                        </div>
                      ) : reg.attended ? (
                        <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <UserCheck size={13} />
                          Attended
                        </div>
                      ) : new Date(event.date) < now ? (
                        <div className="bg-neutral-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <UserX size={13} />
                          Not Attended
                        </div>
                      ) : (
                        <div className="bg-[#22c55e] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 size={14} />
                          Registered
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm font-bold mb-4 tracking-wider uppercase">
                      <Calendar size={14} />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-[22px] font-bold text-neutral-900 mb-4 leading-tight group-hover:text-neutral-700 transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-auto">
                      <MapPin size={16} className="shrink-0 text-neutral-400" />
                      <span className="font-medium text-neutral-600">
                        {event.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-neutral-50 gap-4">
                      {/* Left: Status & Cancel */}
                      <div className="flex flex-col flex-1 justify-center">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                          Status
                        </div>
                        <div className="text-sm font-bold text-[#22c55e]">
                          {reg.paymentStatus}
                        </div>
                        {reg.status === "Cancelled" && (
                          <div className="text-sm font-bold text-red-600 mt-1">
                            Cancelled
                          </div>
                        )}
                      </div>

                      {/* Middle: QR & ID */}
                      <div className="flex flex-col justify-center items-center">
                        <div
                          className={`bg-white p-1 rounded-md mb-2 ${reg.status === "Cancelled" ? "opacity-30 grayscale" : ""}`}
                        >
                          <QRCodeSVG
                            value={reg._id}
                            size={56}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest text-center tabular-nums">
                          Ticket ID: {reg._id.slice(-6)}
                        </span>
                      </div>

                      {/* Right: View Ticket Button */}
                      <div className="flex items-center justify-end gap-2 flex-1">
                        {reg.status !== "Cancelled" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelClick(reg);
                            }}
                            className="bg-red-50 p-3 rounded-2xl text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center shadow-sm w-12 h-12"
                            title="Cancel Ticket"
                          >
                            <X size={20} />
                          </button>
                        )}
                        <Link
                          to={`/ticket/${reg._id}`}
                          className="bg-[#111] p-3 rounded-2xl text-white hover:bg-black transition-colors flex items-center justify-center shadow-lg w-12 h-12"
                          title="View Ticket"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Ticket size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel/Refund Confirmation Modal */}
      {cancellingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isCancelling && setCancellingRegistration(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Background */}
            <div className="bg-red-50 p-8 pb-12 flex flex-col items-center text-center relative border-b border-red-100">
              <button
                onClick={() => !isCancelling && setCancellingRegistration(null)}
                className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 mb-6 relative">
                <div className="absolute inset-0 border-4 border-red-100 rounded-full animate-pulse"></div>
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-950 mb-2">
                Cancel Ticket?
              </h3>
              <p className="text-red-700/80 font-medium px-4">
                You are about to cancel your ticket for{" "}
                <span className="font-bold text-red-900">
                  {cancellingRegistration.event?.title}
                </span>
                .
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-6">
              <div className="bg-neutral-50 rounded-2xl p-5 mb-8 border border-neutral-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 font-medium">
                    Ticket ID
                  </span>
                  <span className="font-mono font-bold text-neutral-900">
                    {cancellingRegistration._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">
                    Event Type
                  </span>
                  <span className="font-bold text-neutral-900">
                    {cancellingRegistration.event?.price > 0
                      ? "Paid Entry"
                      : "Free Entry"}
                  </span>
                </div>
              </div>

              {cancellingRegistration.event?.price > 0 ? (
                <div className="flex gap-4 items-start bg-amber-50 rounded-2xl p-5 mb-8 border border-amber-100/50">
                  <div className="w-8 h-8 rounded-full bg-amber-200/50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-amber-700 font-bold text-sm">₹</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">
                      Refund Information
                    </h4>
                    <p className="text-xs text-amber-700/90 leading-relaxed">
                      Since this is a paid event, confirming this cancellation
                      will automatically initiate a refund request for ₹
                      {cancellingRegistration.event?.price}.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center mb-8 px-4">
                  This action cannot be undone. Please confirm you wish to
                  release your spot.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCancellingRegistration(null)}
                  disabled={isCancelling}
                  className="font-bold py-4 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  Keep Ticket
                </button>
                <button
                  onClick={confirmCancelRegistration}
                  disabled={isCancelling}
                  className="bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-600/20 disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing</span>
                    </>
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
