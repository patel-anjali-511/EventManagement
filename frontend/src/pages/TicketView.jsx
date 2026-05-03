import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  ArrowLeft,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:4000";

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await api.get("/registrations/my");
        const ticket = data.find((r) => r._id === id);
        if (ticket) {
          setRegistration(ticket);
        } else {
          setError("Ticket not found or unauthorized");
        }
      } catch (err) {
        setError("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-900" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-neutral-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Error</h2>
          <p className="text-neutral-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/my-events")}
            className="w-full bg-neutral-900 text-white py-3 rounded-lg font-bold"
          >
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  const { event } = registration;

  return (
    <div className="min-h-screen bg-neutral-50 font-sans py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            onClick={() => navigate("/my-events")}
            className="flex items-center text-neutral-500 hover:text-neutral-900 font-bold text-sm bg-white px-4 py-2 rounded-lg border border-neutral-200 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center text-white bg-neutral-900 hover:bg-neutral-800 font-bold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Printer size={16} className="mr-2" />
            Print / Save PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xl print:shadow-none print:border-neutral-300">
          {event.image && (
            <div className="h-48 overflow-hidden relative">
              <img
                src={`${IMAGE_BASE_URL}${event.image}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-neutral-900/20"></div>
            </div>
          )}

          <div className="p-8">
            <div
              className={`flex flex-col items-center mb-8 pb-8 border-b border-dashed border-neutral-200 ${registration.status === "Cancelled" ? "opacity-50 grayscale" : ""}`}
            >
              <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4">
                Scan at Entrance
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm inline-block mb-4 relative">
                {registration.status === "Cancelled" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl backdrop-blur-[2px]">
                    <span className="text-red-600 font-bold rotate-[-15deg] border-2 border-red-600 px-3 py-1 text-xl tracking-widest">
                      VOID
                    </span>
                  </div>
                )}
                <QRCodeSVG
                  value={registration._id}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-100">
                {registration._id.slice(-8)}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 leading-tight mb-2">
                  {event.title}
                </h1>
                {registration.status === "Cancelled" ? (
                  <p className="text-sm font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle size={14} />
                    Cancelled Ticket
                  </p>
                ) : (
                  <p className="text-sm font-bold text-green-600 uppercase tracking-widest">
                    Verified Ticket
                  </p>
                )}
              </div>

              <div className="bg-neutral-50 rounded-2xl p-6 space-y-4 border border-neutral-100">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Date & Time
                    </div>
                    <div className="font-semibold text-neutral-900">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Location
                    </div>
                    <div className="font-semibold text-neutral-900">
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6 flex justify-between items-center text-sm">
                <div>
                  <div className="text-neutral-400 mb-1">Attendee</div>
                  <div className="font-bold text-neutral-900">
                    {registration.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 mb-1">Status</div>
                  <div className="font-bold text-neutral-900">
                    {registration.paymentStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
