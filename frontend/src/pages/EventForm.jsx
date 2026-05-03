import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Tag,
  AlignLeft,
  MapPin,
  Calendar as CalIcon,
  Users,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    location: "",
    date: "",
    capacity: "",
    price: 0,
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const { data } = await api.get(`/events/${id}`);
          setFormData({
            title: data.title,
            shortDescription: data.shortDescription,
            fullDescription: data.fullDescription,
            location: data.location,
            date: new Date(data.date).toISOString().split("T")[0],
            capacity: data.capacity,
            price: data.price || 0,
          });
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load event data");
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (image) data.append("image", image);

    try {
      if (isEditMode) {
        await api.put(`/events/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/events", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save event");
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 lg:px-12 xl:px-16 pb-24 h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors mb-6 group font-bold text-sm -ml-2 p-2 rounded-lg"
        >
          <ArrowLeft
            size={16}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Events
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
            {isEditMode ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-neutral-500 mt-2 text-base">
            {isEditMode
              ? "Update the details for your event below."
              : "Fill in the details below to organize a new event."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 border border-red-100 shadow-sm flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-10 h-10">
              <div className="absolute border-4 border-neutral-100 rounded-full w-full h-full"></div>
              <div className="absolute border-4 border-neutral-900 border-t-transparent rounded-full w-full h-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden relative">
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 ml-1">
                  Event Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal text-lg"
                    placeholder="e.g. Annual Tech Conference 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 ml-1">
                  Short Description
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-neutral-400" />
                  </div>
                  <textarea
                    name="shortDescription"
                    required
                    rows="2"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal resize-y"
                    placeholder="A brief summary for cards..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 ml-1">
                  Full Description
                </label>
                <div className="rich-text-editor">
                  <ReactQuill
                    theme="snow"
                    value={formData.fullDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullDescription: value,
                      }))
                    }
                    placeholder="Provide comprehensive details about what attendees can expect..."
                    className="bg-neutral-50/50 rounded-2xl overflow-hidden border border-neutral-200 focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-neutral-900 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 ml-1">
                  Event Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full px-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 ml-1">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 placeholder:text-neutral-400"
                      placeholder="Convention Center, NY"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 ml-1">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalIcon className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 uppercase tracking-wide text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 ml-1">
                    Capacity
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="number"
                      name="capacity"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 placeholder:text-neutral-400"
                      placeholder="Number of attendees"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 ml-1">
                    Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-neutral-400 font-bold ml-1">₹</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-neutral-900 placeholder:text-neutral-400"
                      placeholder="Price (0 for free)"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/admin/events")}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-2xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white font-medium rounded-2xl hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{isEditMode ? "Save Changes" : "Publish Event"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventForm;
