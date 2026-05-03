import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Search, ArrowRight } from "lucide-react";
import api from "../api/axios";

const IMAGE_BASE_URL = "http://localhost:4000"; // Backend server address

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/events");
        setEvents(data.events || data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative py-20 px-6 overflow-hidden bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Discover Amazing <br />
            <span className="text-neutral-400">Events Near You</span>
          </h1>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Find and register for the best workshops, conferences, and social
            gatherings. Experience something new today.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-neutral-900 pl-12 pr-4 py-4 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-neutral-400 font-medium"
            />
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-neutral-800 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-neutral-800 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-neutral-500 mt-2">
              Browse the latest events hosted by our community.
            </p>
          </div>
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900">
              No events found
            </h3>
            <p className="text-neutral-500 mt-2">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-16/10 bg-neutral-100 relative overflow-hidden">
                  {event.image ? (
                    <img
                      src={`${IMAGE_BASE_URL}${event.image}`}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-neutral-300 select-none">
                      {event.title.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-900 shadow-sm border border-neutral-100 uppercase tracking-widest">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {event.registrationCount >= event.capacity && (
                      <div className="bg-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-lg shadow-red-500/20 uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-neutral-500 text-sm font-semibold mb-3">
                    <MapPin size={14} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-neutral-800 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-6">
                    {event.shortDescription}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div className="text-neutral-900 font-bold">
                      {event.price > 0 ? `₹${event.price}` : "Free"}
                    </div>
                    <div className="bg-neutral-50 p-2 rounded-lg text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
