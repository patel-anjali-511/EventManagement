import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  CheckCircle2,
  AlertCircle,
  Scan,
  ArrowLeft,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const QRScanner = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async (detectedCodes) => {
    if (detectedCodes.length === 0 || loading || result || error) return;

    const id = detectedCodes[0].rawValue;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post("/registrations/verify", { qrData: id });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Invalid or expired ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:px-12 xl:px-16 pb-24 h-screen overflow-y-auto font-sans bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group font-bold text-sm"
        >
          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
            Ticket Scanner
          </h1>
          <p className="text-neutral-500 mt-2 text-base">
            Scan guest QR codes to verify entry and track attendance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Scanner Section */}
          <div className="relative aspect-square bg-black rounded-[10px] overflow-hidden shadow-2xl border-4 border-white">
            {!result && !error && (
              <Scanner
                onScan={handleScan}
                allowMultiple={true}
                styles={{ container: { width: "100%", height: "100%" } }}
              />
            )}
            <div className="absolute inset-0 border-40 border-black/20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-2xl pointer-events-none">
              <div className="absolute inset-0 border-2 border-white rounded-2xl animate-pulse opacity-50"></div>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="flex flex-col gap-6">
            {!result && !error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[10px] border border-neutral-100 shadow-sm">
                <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6">
                  <Scan className="text-neutral-300 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Ready to Scan
                </h3>
                <p className="text-neutral-500">
                  Position the QR code within the frame to verify the ticket.
                </p>
              </div>
            )}

            {result && (
              <div className="h-full p-8 bg-green-50 rounded-[10px] border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                  <CheckCircle2 className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2 underline decoration-green-200 decoration-4 underline-offset-4">
                  Verified!
                </h3>
                <p className="text-green-700 font-medium mb-8">
                  {result.message}
                </p>

                <div className="space-y-4">
                  <div className="bg-white/60 p-4 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none mb-1">
                        Attendee
                      </div>
                      <div className="font-bold text-neutral-900">
                        {result.attendee}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none mb-1">
                        Event
                      </div>
                      <div className="font-bold text-neutral-900">
                        {result.event}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="w-full mt-8 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-200"
                >
                  Scan Next Ticket
                </button>
              </div>
            )}

            {error && (
              <div className="h-full p-8 bg-red-50 rounded-[10px] border border-red-100 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-200">
                  <AlertCircle className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-2 underline decoration-red-200 decoration-4 underline-offset-4">
                  Access Denied
                </h3>
                <p className="text-red-700 font-medium mb-10">{error}</p>

                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
