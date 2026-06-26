import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  Star,
  CreditCard,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:4000";

const EventDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const paymentHandled = useRef(false);
  const navigate = useNavigate();

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);

        // Check if coming back from successful payment
        const query = new URLSearchParams(location.search);
        const success = query.get("success");
        const sessionId = query.get("session_id");

        if (userInfo) {
          const { data: myRegistrations } = await api.get("/registrations/my");
          const eventRegs = myRegistrations.filter((reg) => reg.event._id === id);

          if (eventRegs.length > 0) {
            setRegistrations(eventRegs);
            setRegistered(true);
          }

          if (success && sessionId && !paymentHandled.current) {
            paymentHandled.current = true;
            handleRegister(sessionId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch event data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, location.search, userInfo, handleRegister]);

  const initiateRegistration = async (e) => {
    if (e) e.preventDefault();

    if (event.price > 0) {
      setRegistering(true);
      try {
        const { data } = await api.post(
          "/registrations/create-checkout-session",
          {
            eventId: id,
            quantity: quantity,
          },
        );
        // Redirect to Stripe Checkout page
        window.location.href = data.url;
      } catch (error) {
        console.error("Failed to create checkout session", error);
        alert(error.response?.data?.message || "Failed to initiate payment");
      } finally {
        setRegistering(false);
      }
    } else {
      handleRegister();
    }
  };

  const handleRegister = useCallback(async (sessionId = null) => {
    setRegistering(true);
    setPaymentProcessing(true);
    try {
      const { data } = await api.post("/registrations", {
        eventId: id,
        sessionId,
        quantity: quantity,
      });
      const newRegs = Array.isArray(data) ? data : [data];
      setRegistrations(prev => [...prev, ...newRegs]);
      setJustRegistered(true);
      setTimeout(() => setJustRegistered(false), 5000); // Reset success state after 5s
      // Clear query params after successful registration
      if (sessionId) {
        navigate(window.location.pathname, { replace: true });
      }
    } catch (error) {
      console.error("Registration failed", error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
      setPaymentProcessing(false);
    }
  }, [id, quantity, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-900 border-t-transparent"></div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Link to="/" className="text-neutral-900 font-medium underline">
          Return home
        </Link>
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors font-medium w-fit"
        >
          <ArrowLeft size={18} />
          Back to events
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10 items-start">
        {/* Left: Event Content */}
        <div className="lg:col-span-7 xl:col-span-8 w-full overflow-hidden">
          <div className="aspect-21/9 bg-neutral-100 rounded-[10px] mb-10 flex items-center justify-center overflow-hidden relative border border-neutral-100">
            {event.image ? (
              <img
                src={`${IMAGE_BASE_URL}${event.image}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-7xl font-bold text-neutral-200 select-none">
                {event.title.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-2xl text-neutral-600 font-semibold border border-neutral-100">
              <Calendar size={18} className="text-neutral-400" />
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-2xl text-neutral-600 font-semibold border border-neutral-100">
              <MapPin size={18} className="text-neutral-400" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-2xl text-neutral-600 font-semibold border border-neutral-100">
              <Users size={18} className="text-neutral-400" />
              {event.capacity} Capacity
            </div>
          </div>

          <div className="prose prose-neutral max-w-none">
            <h3 className="text-2xl font-bold mb-4">About this event</h3>
            <div
              className="text-neutral-600 text-lg leading-relaxed rich-text-content"
              dangerouslySetInnerHTML={{ __html: event.fullDescription }}
            />
          </div>
        </div>

        {/* Right: Registration Card */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <div className="sticky top-28 bg-neutral-900 text-white p-8 md:p-10 rounded-[10px] shadow-2xl overflow-hidden self-start">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-neutral-800 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
              {registrations.length > 0 && (
                <div className="mb-6 flex flex-col gap-3">
                   <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                     <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-0.5">Registration Active</div>
                       <div className="text-white text-sm font-medium">You have {registrations.length} ticket{registrations.length > 1 ? 's' : ''}</div>
                     </div>
                     <button
                       onClick={() => setIsModalOpen(true)}
                       className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                     >
                       <Ticket size={14} />
                       View All
                     </button>
                   </div>
                   {justRegistered && (
                     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20 animate-in fade-in zoom-in duration-300">
                        <p className="text-xs font-medium text-white">Purchase Successful! New tickets added.</p>
                     </div>
                   )}
                </div>
              )}
              
              {new Date(event.date) < new Date() ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8 w-full">
                    <AlertCircle size={36} className="text-neutral-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-neutral-300 mb-2">Event has ended</h2>
                    <p className="text-neutral-500 text-sm">Ticket booking is no longer available for this event.</p>
                  </div>
                </div>
              ) : (
              <>
              <h2 className="text-2xl font-bold mb-2">Register Now</h2>
              <p className="text-neutral-400 text-sm mb-8">
                {userInfo
                  ? "Book additional tickets for yourshelf or guests."
                  : "You must be logged in to register for this event."}
              </p>

              {userInfo ? (
                <div className="space-y-6">
                  {/* ... (registration form content) */}
                  <div className="space-y-4">
                    <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 ml-1">
                        Attendee Name
                      </label>
                      <div className="text-white font-medium px-1">
                        {userInfo.name}
                      </div>
                    </div>
                    <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 ml-1">
                        Email Address
                      </label>
                      <div className="text-white font-medium px-1">
                        {userInfo.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="bg-neutral-800/50 p-6 rounded-[10px] border border-neutral-800 mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-neutral-400">
                          Registration Fee
                        </span>
                        <span className="font-bold">
                          {event.price > 0
                            ? `₹${event.price * quantity} (₹${event.price} x ${quantity})`
                            : "FREE"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500">
                          Available Spots
                        </span>
                        <span
                          className={`font-bold ${event.capacity - event.registrationCount <= 5 ? "text-orange-400" : "text-neutral-300"}`}
                        >
                          {event.capacity - event.registrationCount} remaining
                        </span>
                      </div>
                    </div>

                    {event.registrationCount >= event.capacity ? (
                      <div className="w-full bg-neutral-800 text-neutral-500 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-neutral-700">
                        <AlertCircle size={18} />
                        <span>Event Sold Out</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-neutral-800/50 p-6 rounded-[10px] border border-neutral-800 mb-8 flex justify-between items-center">
                          <span className="text-neutral-400">
                            Ticket Quantity
                          </span>
                          <div className="flex items-center gap-4 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-700">
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                              disabled={
                                quantity <= 1 ||
                                registering ||
                                paymentProcessing
                              }
                              className="text-white hover:text-neutral-300 disabled:opacity-50 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-bold w-4 text-center">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity(
                                  Math.min(
                                    event.capacity - event.registrationCount,
                                    quantity + 1,
                                  ),
                                )
                              }
                              disabled={
                                quantity >=
                                  event.capacity - event.registrationCount ||
                                registering ||
                                paymentProcessing
                              }
                              className="text-white hover:text-neutral-300 disabled:opacity-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={initiateRegistration}
                          disabled={registering || paymentProcessing}
                          className="w-full bg-white text-neutral-900 font-bold py-5 rounded-2xl hover:bg-neutral-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {registering || paymentProcessing ? (
                            <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span>
                                {event.price > 0
                                  ? "Proceed to Payment"
                                  : "Confirm & Register"}
                              </span>
                              <Star size={18} fill="currentColor" />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-4">
                  <div className="bg-neutral-800/50 p-8 rounded-[10px] border border-neutral-800 border-dashed mb-8 text-center">
                    <p className="text-neutral-500 text-sm mb-6">
                      Create an account or login to secure your spot.
                    </p>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                      className="inline-block w-full bg-white text-neutral-900 font-bold py-4 rounded-lg hover:bg-neutral-100 transition-all"
                    >
                      Login to Register
                    </Link>
                  </div>
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <div>
                <h3 className="text-xl font-bold text-white">Your Tickets</h3>
                <p className="text-neutral-500 text-sm mt-1">Found {registrations.length} registrations</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white p-2 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="rotate-90" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
              {registrations.map((reg, index) => (
                <div
                  key={reg._id}
                  className="bg-neutral-800 rounded-2xl p-6 text-left border border-neutral-700 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 bg-neutral-700/30 text-[10px] font-bold uppercase tracking-widest text-neutral-500 rounded-bl-xl">
                    Ticket {index + 1}
                  </div>
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">
                      Ticket ID
                    </div>
                    <div className="font-mono text-xs tracking-wider text-neutral-300">
                      {reg._id.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex justify-center items-center bg-white p-4 rounded-xl w-fit mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <QRCodeSVG value={reg._id} size={140} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-neutral-800/30 border-t border-neutral-800 grid grid-cols-2 gap-4">
              <button
                onClick={() => window.print()}
                className="w-full bg-white text-neutral-900 font-bold py-4 rounded-xl hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
              >
                <Ticket size={18} />
                Print All
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-neutral-800 text-white font-bold py-4 rounded-xl hover:bg-neutral-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Premium Ticket Print Template (Hidden from UI, visible only for print) */}
      {registered && event && createPortal(
        <div id="ticket-print-template">
          {registrations.map((reg, index) => (
            <div key={reg._id} className="ticket-container">
              <div className="ticket-content">
                {/* Event Image */}
                <div className="ticket-image-container">
                  {event.image ? (
                    <img
                      src={`${IMAGE_BASE_URL}${event.image}`}
                      alt={event.title}
                      className="ticket-image"
                    />
                  ) : (
                    <div className="ticket-image-placeholder">
                      {event.title.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="ticket-details">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="ticket-title" style={{ margin: 0 }}>{event.title}</h1>
                    <span className="bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black">
                      Ticket {index + 1} of {registrations.length}
                    </span>
                  </div>
                  <div className="ticket-info">
                    <div className="info-item">
                      <span className="info-label">Venue</span>
                      <span className="info-value">{event.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Attendee</span>
                      <span className="info-value">{reg.name}</span>
                    </div>
                  </div>
                </div>

                {/* QR and ID Section */}
                <div className="ticket-footer">
                  <div className="ticket-qr">
                    <QRCodeSVG
                      value={reg._id}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="ticket-id-section">
                    <div className="info-label">Ticket ID</div>
                    <div className="ticket-id">
                      {reg._id.toUpperCase()}
                    </div>
                    {reg.bookingId && (
                      <div className="mt-2">
                         <div className="info-label">Booking ID</div>
                         <div className="ticket-id" style={{ fontSize: '10px' }}>
                           {reg.bookingId}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="ticket-branding">
                EventNest • Premium Event Entry
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}

      <style>{`
        @media screen {
          #ticket-print-template {
            display: none !important;
          }
        }

        @media print {
          /* Hide everything except our portal */
          body > *:not(#ticket-print-template) {
            display: none !important;
          }

          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #ticket-print-template {
            display: block !important;
            width: 100%;
            background: white !important;
            -webkit-print-color-adjust: exact;
          }

          .ticket-container {
            background: white;
            color: black;
            width: 450px;
            margin: 40px auto;
            border: 2px solid #eee;
            border-radius: 24px;
            overflow: hidden;
            font-family: sans-serif;
            page-break-after: always;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
          }

          .ticket-container:last-child {
            page-break-after: auto;
          }

          .ticket-image-container {
            width: 100%;
            height: 200px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .ticket-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .ticket-image-placeholder {
            font-size: 80px;
            font-weight: bold;
            color: #ddd;
          }

          .ticket-content {
            padding: 32px;
            color: black;
          }

          .ticket-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 24px;
            color: black;
            line-height: 1.2;
          }

          .ticket-details {
            margin-bottom: 32px;
            text-align: left;
          }

          .info-item {
            margin-bottom: 16px;
          }

          .info-label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #999;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 16px;
            font-weight: 500;
            color: #111;
          }

          .ticket-footer {
            display: flex;
            align-items: center;
            gap: 24px;
            padding-top: 24px;
            border-top: 1px dashed #eee;
          }

          .ticket-qr {
            background: white;
            padding: 8px;
            border: 1px solid #eee;
            border-radius: 12px;
          }

          .ticket-id-section {
            flex: 1;
            text-align: left;
          }

          .ticket-id {
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 1px;
            color: #666;
            word-break: break-all;
          }

          .ticket-branding {
            background: #fafafa;
            text-align: center;
            padding: 12px;
            font-size: 10px;
            color: #bbb;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-top: 1px solid #f0f0f0;
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetails;
