import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
  RotateCcw,
  Ban,
  Info,
} from "lucide-react";
import api from "../api/axios";
import { DataTable } from "@/components/ui/data-table";

const RefundModal = ({ modal, onClose, onConfirm, actionLoading }) => {
  if (!modal.open) return null;

  const isAccept = modal.type === "accept";
  const siblingPending = modal.siblingPending || [];
  const hasSiblings = siblingPending.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!actionLoading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div
          className={`h-1.5 w-full ${isAccept ? "bg-linear-to-r from-green-400 to-emerald-500" : "bg-linear-to-r from-red-400 to-rose-500"}`}
        />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAccept ? "bg-green-50" : "bg-red-50"}`}
              >
                {isAccept ? (
                  <RotateCcw size={18} className="text-green-600" />
                ) : (
                  <Ban size={18} className="text-red-500" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  {isAccept ? "Process Refund" : "Reject Refund"}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isAccept ? "This will trigger a Stripe refund" : "The request will be closed"}
                </p>
              </div>
            </div>
            {!actionLoading && (
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-lg hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Customer</span>
              <span className="text-sm font-bold text-neutral-800">{modal.payment?.user?.name || "—"}</span>
            </div>
            <div className="border-t border-neutral-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Event</span>
              <span className="text-sm font-semibold text-neutral-600 text-right max-w-[60%] truncate">
                {modal.payment?.event?.title || "Deleted Event"}
              </span>
            </div>
            <div className="border-t border-neutral-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Ticket ID</span>
              <span className="text-[11px] font-mono text-neutral-500">{modal.payment?._id?.slice(-10).toUpperCase()}</span>
            </div>
            <div className="border-t border-neutral-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Amount</span>
              <span className="text-sm font-bold text-neutral-900">₹{modal.payment?.amount}</span>
            </div>
          </div>

          {hasSiblings && (
            <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-4 border bg-neutral-50 border-neutral-200">
              <Info size={13} className="mt-0.5 shrink-0 text-neutral-400" />
              <p className="text-xs text-neutral-500 leading-relaxed">
                <strong className="text-neutral-700">{siblingPending.length} other ticket{siblingPending.length > 1 ? 's' : ''}</strong> from the same booking also {siblingPending.length > 1 ? 'have' : 'has'} a pending refund request. This action only applies to the ticket above.
              </p>
            </div>
          )}

          <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
            {isAccept
              ? "This will immediately initiate a partial refund via Stripe for this ticket. The customer will receive the amount within 5–7 business days."
              : "The refund request will be rejected and this ticket will be reactivated. An email notification will be sent."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={actionLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                isAccept
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isAccept ? "Processing..." : "Rejecting..."}
                </>
              ) : isAccept ? (
                "Confirm Refund"
              ) : (
                "Reject Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [refundFilter, setRefundFilter] = useState("All");

  const [modal, setModal] = useState({ open: false, type: null, paymentId: null, payment: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      if (refundFilter !== "All") params.set("refundStatus", refundFilter);
      const { data } = await api.get(`/payments?${params.toString()}`);
      setPayments(data.payments);
      setTotalItems(data.total);
      setPageCount(data.pages);
    } catch (err) {
      console.error("Failed to fetch payments", err);
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, refundFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefundFilterChange = (value) => {
    setRefundFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const openModal = (type, payment) => {
    const siblingPending = payments.filter(
      (p) => p.stripePaymentId === payment.stripePaymentId && p.refundStatus === "Requested" && p._id !== payment._id
    );
    setModal({ open: true, type, paymentId: payment._id, payment, siblingPending });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setModal({ open: false, type: null, paymentId: null, payment: null });
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      if (modal.type === "accept") {
        await api.post(`/payments/${modal.paymentId}/refund`);
        setSuccessMessage("Refund processed successfully!");
      } else {
        await api.post(`/payments/${modal.paymentId}/reject-refund`);
        setSuccessMessage("Refund request rejected.");
      }
      closeModal();
      fetchPayments();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const p = row.original;
        const isRequested = p.refundStatus === "Requested";
        return (
          <div className="flex items-center gap-1.5">
              {isRequested ? (
                <>
                  <button
                    onClick={() => openModal("accept", p)}
                    className="px-2.5 py-1 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Accept Refund"
                  >
                    <RotateCcw size={11} />
                    Accept
                  </button>
                  <button
                    onClick={() => openModal("reject", p)}
                    className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-600 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors flex items-center gap-1"
                    title="Reject Refund"
                  >
                    <Ban size={11} />
                    Reject
                  </button>
                </>
              ) : (
                <span className="text-[10px] uppercase font-bold text-neutral-300">
                  --
                </span>
              )}
          </div>
        );
      },
    },
    {
      id: "user",
      accessorFn: (row) => row.user?.name,
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-900 text-sm">
            {row.original.user?.name || "Unknown"}
          </span>
          <span className="text-[10px] text-neutral-400">
            {row.original.user?.email || ""}
          </span>
        </div>
      ),
    },
    {
      id: "event",
      accessorFn: (row) => row.event?.title,
      header: "Event",
      cell: ({ row }) => (
        <span className="text-neutral-500 font-medium text-sm">
          {row.original.event?.title || "Deleted Event"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-bold text-neutral-900 flex items-center gap-1 text-sm">
          ₹{row.original.amount}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Payment",
      cell: ({ row }) => {
        const s = row.original.status;
        let color = "text-green-600";
        if (s === "Failed") color = "text-red-600";
        if (s === "Refunded") color = "text-amber-600";

        return (
          <div
            className={`text-[10px] font-bold uppercase tracking-wider ${color}`}
          >
            {s}
          </div>
        );
      },
    },
    {
      accessorKey: "refundStatus",
      header: "Refund Status",
      cell: ({ row }) => {
        const r = row.original.refundStatus;
        if (r === "None")
          return (
            <span className="text-neutral-300 text-[10px] uppercase font-bold tracking-wider">
              -
            </span>
          );

        let color = "text-blue-600 bg-blue-50 border-blue-100";
        if (r === "Processed")
          color = "text-green-600 bg-green-50 border-green-100";
        if (r === "Rejected")
          color = "text-neutral-500 bg-neutral-100 border-neutral-200";
        if (r === "Requested")
          color = "text-amber-600 bg-amber-50 border-amber-100 animate-pulse";

        return (
          <div
            className={`inline-flex px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${color}`}
          >
            {r}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-neutral-400 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 font-sans space-y-8">
      <RefundModal
        modal={modal}
        onClose={closeModal}
        onConfirm={handleConfirm}
        actionLoading={actionLoading}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Track transactions, monitor Stripe payments, and issue refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-neutral-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Refund</span>
          <div className="flex items-center gap-1 bg-white border border-neutral-100 rounded-lg p-1">
            {["All", "None", "Requested", "Processed", "Rejected"].map((option) => (
              <button
                key={option}
                onClick={() => handleRefundFilterChange(option)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                  refundFilter === option
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {loading && !payments.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-neutral-50">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-2" />
          <p className="text-neutral-500 text-sm font-medium">
            Loading transactions...
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          searchKey="user"
          placeholder="Search Here..."
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

export default Payments;
