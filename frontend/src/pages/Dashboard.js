import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast, ToastContainer } from "../components/Toast";

function formatPrice(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function PropertyCard({ property, onToggleFav, loading }) {
  return (
    <div className="property-card">
      <div className="card-image">
        <img src={property.image_url} alt={property.title} loading="lazy" />
        {property.tag && <span className="card-tag">{property.tag}</span>}
        <button
          className={`fav-btn ${property.is_favourite ? "active" : ""}`}
          onClick={() => onToggleFav(property.id, property.is_favourite)}
          disabled={loading}
          title={property.is_favourite ? "Remove from favourites" : "Add to favourites"}
          aria-label={property.is_favourite ? "Remove from favourites" : "Add to favourites"}
        >
          {property.is_favourite ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-price">{formatPrice(property.price)}</div>
        <div className="card-title">{property.title}</div>
        <div className="card-address">📍 {property.address}</div>
        <div className="card-specs">
          <span>🛏 {property.bedrooms} bed</span>
          <span>🚿 {property.bathrooms} bath</span>
          <span>📐 {property.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user,logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();

  const [tab, setTab] = useState("all"); 
  const [properties,setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoadingProps(true);
    try {
      const res = await authFetch("/api/properties");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProperties(data.properties.map((p) => ({ ...p, is_favourite: !!p.is_favourite })));
    } catch (err) {
      addToast(err.message || "Failed to load properties.", "error");
    } finally {
      setLoadingProps(false);
    }
  }, [authFetch,addToast]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleToggleFav = async (propertyId, currentlyFaved) => {
    setTogglingId(propertyId);
    try {
      const res = await authFetch(`/api/properties/${propertyId}/favourite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, is_favourite: data.favourited } : p
        )
      );
      addToast(data.message, "success");
    } catch (err) {
      addToast(err.message || "Action failed.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayed =
    tab === "all" ? properties : properties.filter((p) => p.is_favourite);

  const favCount = properties.filter((p) => p.is_favourite).length;

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-logo">REALstate<span>.</span>I0</div>
        <div className="topbar-right">
          <span className="topbar-user">
            Welcome, <strong>{user?.name}</strong>
          </span>
          <span className="badge">{user?.role}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-body">
        <div className="welcome-banner">
          <div>
            <h2>Good to see you, {user?.name?.split(" ")[0]}.</h2>
            <p>Browse properties and save the ones you love.</p>
          </div>
          <div className="welcome-stats">
            <div className="stat">
              <div className="stat-number">{properties.length}</div>
              <div className="stat-label">Listings</div>
            </div>
            <div className="stat">
              <div className="stat-number">{favCount}</div>
              <div className="stat-label">Favourites</div>
            </div>
          </div>
        </div>

        <div className="section-tabs">
          <button
            className={`tab-btn ${tab === "all" ? "active" : ""}`}
            onClick={() => setTab("all")}
          >
            All Properties ({properties.length})
          </button>
          <button
            className={`tab-btn ${tab === "favourites" ? "active" : ""}`}
            onClick={() => setTab("favourites")}
          >
            My Favourites ({favCount})
          </button>
        </div>

        {loadingProps ? (
          <div className="loader">
            <div className="spinner" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>{tab === "favourites" ? "No favourites yet" : "No properties found"}</h3>
            <p>
              {tab === "favourites"
                ? "Browse all properties and tap the heart to save your favourites."
                : "Check back soon for new listings."}
            </p>
          </div>
        ) : (
          <div className="property-grid">
            {displayed.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onToggleFav={handleToggleFav}
                loading={togglingId === p.id}
              />
            ))}
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
