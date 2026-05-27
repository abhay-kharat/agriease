import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import PremiumLoader from "../../components/PremiumLoader";
import ThemeToggle from "../../components/ThemeToggle";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/delivery-agent-dashboard.css";

const STATUS_STEPS = ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

const ACTION_BY_STATUS = {
  ASSIGNED: "pickup",
  PICKED_UP: "out-for-delivery",
  OUT_FOR_DELIVERY: "delivered",
};

function normalizeStatus(status) {
  return (status || "").trim().toUpperCase();
}

function getSupplierName(order, fallback) {
  const pickup = order?.supplierPickupLocation || "";
  return pickup.split(",")[0]?.trim() || fallback;
}

function toDisplayProduct(fallback) {
  return fallback;
}

function getMapUrl(origin, destination) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (key) {
    return `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(key)}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(`${origin} to ${destination}`)}&output=embed`;
}

export default function DeliveryAgentDashboard() {
  const { t, language } = useLanguage();
  const { user, updateUser, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proofFiles, setProofFiles] = useState({});
  const [proofPreviewByOrder, setProofPreviewByOrder] = useState({});
  const [acceptedOrderIds, setAcceptedOrderIds] = useState(new Set());
  const [rejectedOrderIds, setRejectedOrderIds] = useState(new Set());
  const [deliveredAtByOrder, setDeliveredAtByOrder] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicleName: "",
    vehicleNumber: "",
    deliveryArea: "",
    rating: "",
  });

  const locale = language === "mr" ? "mr-IN" : "en-IN";

  const loadAgentProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/agent/profile");
      const profile = response.data || {};
      setProfileForm({
        name: profile.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        vehicleName: profile.vehicleName || t("agent.dashboard.defaultVehicleName"),
        vehicleNumber: profile.vehicleNumber || "",
        deliveryArea: profile.deliveryArea || "",
        rating: profile.rating ?? "5.0",
      });
      updateUser({
        name: profile.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        vehicleName: profile.vehicleName || t("agent.dashboard.defaultVehicleName"),
        vehicleNumber: profile.vehicleNumber || "",
        deliveryArea: profile.deliveryArea || "",
        rating: profile.rating ?? "5.0",
      });
    } catch (error) {
    }
  }, [t, updateUser, user?.email]);

  const agentProfile = useMemo(
    () => ({
      name: profileForm.name || user?.name || "Delivery Agent",
      phone: profileForm.phone || user?.phone || "Not provided",
      vehicleName: profileForm.vehicleName || user?.vehicleName || "Truck",
      vehicleNumber: profileForm.vehicleNumber || user?.vehicleNumber || "Not provided",
      deliveryArea: profileForm.deliveryArea || user?.deliveryArea || "Local Area",
      rating: profileForm.rating || user?.rating || "5.0",
      email: profileForm.email || user?.email || "",
      address: profileForm.address || user?.address || "",
    }),
    [profileForm, t, user]
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agent/orders");
      const fetched = res.data || [];
      setOrders(fetched);
      if (!selectedOrderId && fetched.length) {
        setSelectedOrderId(fetched[0].orderId);
      }
      setLastUpdated(new Date());
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [selectedOrderId, t]);

  useEffect(() => {
    fetchOrders();
    loadAgentProfile();
  }, [fetchOrders, loadAgentProfile]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      setProfileSaving(true);
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        vehicleName: profileForm.vehicleName,
        vehicleNumber: profileForm.vehicleNumber,
        deliveryArea: profileForm.deliveryArea,
      };
      const response = await api.put("/api/agent/profile", payload);
      const updatedProfile = response?.data?.user || response?.data || {};
      setProfileForm((prev) => ({
        ...prev,
        ...updatedProfile,
        rating: updatedProfile.rating ?? prev.rating,
      }));
      updateUser(updatedProfile);
      setIsEditingProfile(false);
      toast.success(t("messages.profileUpdated"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("messages.profileUpdateError"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(t("agent.dashboard.deleteConfirm"));
    if (!confirmed) return;
    try {
      setDeletingProfile(true);
      try { await api.delete("/api/user/account"); } catch (e) { await api.delete("/user/account"); }
      toast.success(t("agent.dashboard.profileDeleted"));
      logout();
    } catch (error) {
      toast.error(t("agent.dashboard.deleteProfileFailed"));
    } finally {
      setDeletingProfile(false);
    }
  };

  const updateStatus = async (orderId, action, payload = {}) => {
    try {
      await api.put(`/api/delivery/${orderId}/${action}`, payload);
      toast.success(t("agent.dashboard.orderUpdated"));
      if (action === "delivered") {
        setDeliveredAtByOrder((prev) => ({ ...prev, [orderId]: new Date().toISOString() }));
      }
      fetchOrders();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || t("messages.updateStatusError"));
      return false;
    }
  };

  const uploadProof = async (orderId) => {
    const file = proofFiles[orderId];
    if (!file) {
      toast.error(t("agent.dashboard.chooseImageFirst"));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/api/delivery/${orderId}/upload-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProofPreviewByOrder((prev) => ({
        ...prev,
        [orderId]: URL.createObjectURL(file),
      }));
      toast.success(t("agent.dashboard.proofUploaded"));
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("agent.dashboard.proofUploadFailed"));
    }
  };

  const collectCodPayment = async (orderId) => {
    try {
      await api.put(`/api/delivery/${orderId}/collect-payment`);
      toast.success(t("agent.dashboard.paymentCollected"));
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || t("agent.dashboard.collectPaymentFailed"));
    }
  };

  const incomingRequests = useMemo(
    () =>
      orders.filter(
        (order) => normalizeStatus(order.status) === "ASSIGNED" && !rejectedOrderIds.has(order.orderId)
      ),
    [orders, rejectedOrderIds]
  );

  const acceptedOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (rejectedOrderIds.has(order.orderId)) return false;
        const status = normalizeStatus(order.status);
        if (status === "FAILED_DELIVERY" || status === "CANCELLED" || status === "RETURNED") return false;
        return acceptedOrderIds.has(order.orderId) || status !== "ASSIGNED";
      }),
    [orders, acceptedOrderIds, rejectedOrderIds]
  );

  const historyOrders = useMemo(
    () => orders.filter((order) => normalizeStatus(order.status) === "DELIVERED"),
    [orders]
  );

  const selectableOrders = useMemo(
    () => orders.filter((order) => !rejectedOrderIds.has(order.orderId)),
    [orders, rejectedOrderIds]
  );

  const selectedOrder =
    selectableOrders.find((order) => order.orderId === selectedOrderId) || selectableOrders[0] || null;

  const stats = useMemo(() => {
    const assigned = incomingRequests.length;
    const pending = incomingRequests.length;
    const inTransit = orders.filter((order) => {
      const status = normalizeStatus(order.status);
      return status === "PICKED_UP" || status === "OUT_FOR_DELIVERY";
    }).length;
    const deliveredToday = historyOrders.length;
    return { assigned, pending, inTransit, deliveredToday };
  }, [incomingRequests.length, orders, historyOrders.length]);

  const stepState = (status, step) => {
    const normalized = normalizeStatus(status);
    if (step === "IN_TRANSIT") {
      if (normalized === "PICKED_UP" || normalized === "OUT_FOR_DELIVERY" || normalized === "DELIVERED") {
        return "complete";
      }
      return "todo";
    }
    const order = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = order.indexOf(normalized);
    const stepIndex = order.indexOf(step);
    if (normalized === step) return "active";
    if (stepIndex !== -1 && currentIndex >= stepIndex) return "complete";
    return "todo";
  };

  const handleAccept = async (orderId) => {
    const updated = await updateStatus(orderId, "accept");
    if (!updated) return;
    setAcceptedOrderIds((prev) => new Set([...prev, orderId]));
    setSelectedOrderId(orderId);
  };

  const handleReject = async (orderId) => {
    const reasonInput = window.prompt(t("agent.dashboard.rejectPrompt"), "");
    if (reasonInput === null) return;
    const reason = reasonInput.trim();
    const payload = reason ? { reason } : {};
    const updated = await updateStatus(orderId, "reject", payload);
    if (!updated) return;
    setRejectedOrderIds((prev) => new Set([...prev, orderId]));
    setSelectedOrderId((prevSelected) => {
      if (prevSelected !== orderId) return prevSelected;
      const fallback = orders.find((order) => order.orderId !== orderId && !rejectedOrderIds.has(order.orderId));
      return fallback?.orderId ?? null;
    });
    toast.info(t("agent.dashboard.orderRejected"));
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    const detailsSection = document.querySelector(".agent-dashboard-grid--bottom");
    detailsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavigate = (order) => {
    if(!order) return;
    const origin = order?.supplierPickupLocation || "Warehouse";
    const destination = order?.farmerDeliveryLocation || "Destination";
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const chartData = useMemo(
    () => [
      { label: "MON", value: 12, fill: "var(--agent-green-700)" },
      { label: "TUE", value: 45, fill: "var(--agent-green-700)" },
      { label: "WED", value: 20, fill: "var(--agent-green-800)" },
      { label: "THU", value: 80, fill: "var(--agent-green-900)" },
      { label: "FRI", value: 35, fill: "var(--agent-green-700)" },
      { label: "SAT", value: 95, fill: "var(--agent-green-900)" },
      { label: "SUN", value: 65, fill: "var(--agent-green-800)" },
    ],
    [t]
  );

  const nextAction = selectedOrder ? ACTION_BY_STATUS[normalizeStatus(selectedOrder.status)] : null;

  return (
    <motion.div className="agent-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {loading && <PremiumLoader label={"Loading Dashboard..."} role="delivery" />}
      
      <header className="agent-dashboard__header">
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
           <div className="agent-dashboard__actions">
             <LanguageSwitcher />
             <ThemeToggle />
           </div>
        </div>
        <div className="agent-dashboard__header-actions">
           <Button className="btn primary" onClick={() => setIsEditingProfile(!isEditingProfile)}>{"Edit Agent Profile"}</Button>
           <Button className="btn primary" onClick={fetchOrders} disabled={loading}>{"Refresh"}</Button>
           <Button className="btn" onClick={logout}>{"Logout"}</Button>
        </div>
      </header>

      {isEditingProfile && (
      <section className="agent-card agent-card--profile agent-card--profile-v2">
        <div className="agent-profile-v2__header">
          <div className="agent-profile-v2__avatar">{(agentProfile.name || "A").charAt(0).toUpperCase()}</div>
          <div>
            <h2>{"Agent Account Settings"}</h2>
            <p>{"Update your contact details and delivery setup."}</p>
          </div>
        </div>

        <div className="agent-profile-v2__grid">
          <article className="agent-profile-v2__card">
            <h3>{"Personal Information"}</h3>
            <div className="agent-profile-form">
              <label>
                {"Full Name"}
                <input name="name" value={profileForm.name} onChange={handleProfileChange} className="input" />
              </label>
              <label>
                {"Email Address"}
                <input name="email" value={profileForm.email} className="input" disabled />
              </label>
              <label>
                {"Phone Contact"}
                <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="input" />
              </label>
              <label>
                {"Home Address"}
                <textarea name="address" value={profileForm.address} onChange={handleProfileChange} className="input" rows="3" />
              </label>
            </div>
          </article>

          <article className="agent-profile-v2__card">
            <h3>{"Delivery Preferences"}</h3>
            <div className="agent-profile-form">
              <label>
                {"Vehicle"}
                <input name="vehicleName" value={profileForm.vehicleName} onChange={handleProfileChange} className="input" />
              </label>
              <label>
                {"Vehicle Number"}
                <input name="vehicleNumber" value={profileForm.vehicleNumber} onChange={handleProfileChange} className="input" />
              </label>
              <label>
                {"Service Area"}
                <input name="deliveryArea" value={profileForm.deliveryArea} onChange={handleProfileChange} className="input" />
              </label>
              <label>
                {"Current Rating"}
                <input name="rating" value={profileForm.rating} className="input" disabled />
              </label>
            </div>
          </article>
        </div>

        <div className="agent-profile-actions">
          <Button className="btn primary square" onClick={handleProfileSave} loading={profileSaving}>
            {"Save Profile Settings"}
          </Button>
          <Button className="btn square" onClick={() => { setIsEditingProfile(false); loadAgentProfile(); }}>
            {"Cancel Edit"}
          </Button>
          <Button
            className="btn square agent-delete-btn"
            onClick={handleDeleteProfile}
            loading={deletingProfile}
          >
            {"Delete Agent Account"}
          </Button>
        </div>
      </section>
      )}

      <section className="agent-dashboard-grid agent-dashboard-grid--top">
        <article className="agent-card">
          <h2>{"Live Tracking Map"}</h2>
          {!selectedOrder && (
            <div className="agent-map-placeholder">
              <p>{"Select an order from the list to view route"}</p>
            </div>
          )}
          {selectedOrder && (
            <>
              <div className="agent-map-header">
                <div>
                  <span className="agent-map-badge">{"PICKUP"}</span>
                  <p>{getSupplierName(selectedOrder, "Warehouse")}</p>
                </div>
                <div className="agent-map-line"></div>
                <div>
                  <span className="agent-map-badge agent-map-badge--drop">{"DROP-OFF"}</span>
                  <p>{selectedOrder.farmerDeliveryLocation || "Destination"}</p>
                </div>
              </div>
              <div className="agent-map-frame">
                <iframe
                  title={"Route Map"}
                  src={getMapUrl(
                    selectedOrder.supplierPickupLocation || "Warehouse",
                    selectedOrder.farmerDeliveryLocation || "Destination"
                  )}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="agent-map-embed"
                  allowFullScreen
                />
              </div>
            </>
          )}
        </article>

        <div className="agent-analytics-stack">
          <article className="agent-card agent-card--compact">
            <h2>{"Agent Details"}</h2>
            <div className="agent-profile-row"><span>{"Full Name"}</span><strong>{agentProfile.name}</strong></div>
            <div className="agent-profile-row"><span>{"Vehicle"}</span><strong>{agentProfile.vehicleName}</strong></div>
            <div className="agent-profile-row"><span>{"Vehicle Number"}</span><strong>{agentProfile.vehicleNumber}</strong></div>
            <div className="agent-profile-row"><span>{"Service Area"}</span><strong>{agentProfile.deliveryArea}</strong></div>
            <div className="agent-profile-row"><span>{"Rating"}</span><strong>{agentProfile.rating}</strong></div>
          </article>

          <article className="agent-card agent-card--compact">
            <h2>{"Operations Pulse"}</h2>
            <div className="agent-metric-strip">
              <div className="agent-metric-chip">
                <span>{"Pending Orders"}</span>
                <strong>{incomingRequests.length}</strong>
              </div>
              <div className="agent-metric-chip">
                <span>{"Active Target"}</span>
                <strong>{acceptedOrders.length}</strong>
              </div>
              <div className="agent-metric-chip">
                <span>{t("agent.dashboard.selectedOrder")}</span>
                <strong>{selectedOrder ? `#${selectedOrder.orderId}` : "None Selected"}</strong>
              </div>
            </div>
          </article>

          <article className="agent-card agent-card--compact">
            <h2>{"Payment Tracking"}</h2>
            <div className="agent-metric-strip">
              <div className="agent-metric-chip">
                <span>{"Pending COD"}</span>
                <strong>{acceptedOrders.filter((order) => (order.paymentMethod || "").toLowerCase() === "cod" && (order.paymentStatus || "").toUpperCase() !== "PAID").length}</strong>
              </div>
              <div className="agent-metric-chip">
                <span>{"Completed Drop-offs"}</span>
                <strong>{historyOrders.length}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="agent-dashboard-grid agent-dashboard-grid--middle">
        <article className="agent-stat-card">
          <span className="agent-stat-icon">AO</span>
          <div><p>{"Assigned"}</p><strong>{stats.assigned}</strong></div>
        </article>
        <article className="agent-stat-card">
          <span className="agent-stat-icon">PR</span>
          <div><p>{"Pending"}</p><strong>{stats.pending}</strong></div>
        </article>
        <article className="agent-stat-card">
          <span className="agent-stat-icon">IT</span>
          <div><p>{"In Transit"}</p><strong>{stats.inTransit}</strong></div>
        </article>
        <article className="agent-stat-card">
          <span className="agent-stat-icon">DT</span>
          <div><p>{"Delivered Today"}</p><strong>{stats.deliveredToday}</strong></div>
        </article>
      </section>

      <section className="agent-dashboard-grid agent-dashboard-grid--bottom">
        <article className="agent-card agent-card--chart">
          <div className="agent-card__heading">
            <div>
              <p className="agent-card__eyebrow">{"Dispatch Analytics"}</p>
              <h2>{"Daily Delivery Load"}</h2>
            </div>
            <span className="agent-card__tag">{"Live Stats"}</span>
          </div>
          <div className="agent-chart-shell">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(249, 115, 22, 0.14)" />
                <XAxis dataKey="label" stroke="#9a3412" tickLine={false} axisLine={false} />
                <YAxis stroke="#9a3412" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--tooltip-border)",
                    background: "var(--tooltip-bg)",
                    boxShadow: "var(--shadow-soft)",
                    color: "var(--ink)",
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="agent-card">
          <h2>{"Delivery Progress Tracker"}</h2>
          {!selectedOrder && <p className="agent-empty">{"Select an order to view detailed progress"}</p>}
          {selectedOrder && (
            <>
              <p className="agent-order-meta">
                {"Tracking Order"} <strong>#{selectedOrder.orderId}</strong> {"for"} {selectedOrder.farmerName || "Farmer"}.
              </p>
              <div className="agent-progress">
                {STATUS_STEPS.map((step) => {
                  const state = stepState(selectedOrder.status, step);
                  return (
                    <div key={step} className={`agent-progress-step agent-progress-step--${state}`}>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
              {nextAction && (
                <Button className="btn primary square" onClick={() => updateStatus(selectedOrder.orderId, nextAction)}>
                  {"Proceed to Next Phase →"}
                </Button>
              )}
              {normalizeStatus(selectedOrder.status) === "DELIVERED" && (
                <>
                  <div className="agent-proof-uploader">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setProofFiles((prev) => ({ ...prev, [selectedOrder.orderId]: file }));
                      }}
                    />
                    <Button className="btn square" onClick={() => uploadProof(selectedOrder.orderId)}>
                      {"Upload Proof of Delivery Photo"}
                    </Button>
                  </div>
                  {(selectedOrder.paymentMethod || "").toLowerCase() === "cod" &&
                    (selectedOrder.paymentStatus || "").toUpperCase() !== "PAID" && (
                    <div className="agent-cod-collect">
                      <p>{"Cash on Delivery Request"}: <strong>{"Amount Payable"}: INR {selectedOrder.totalAmount || "N/A"}</strong></p>
                      <Button className="btn primary square" onClick={() => collectCodPayment(selectedOrder.orderId)}>
                        {"✓ Mark COD Collected"}
                      </Button>
                    </div>
                  )}
                  {(selectedOrder.paymentStatus || "").toUpperCase() === "PAID" && (
                    <p className="agent-payment-collected">{"Payment Collected. Delivery Complete."}</p>
                  )}
                </>
              )}
            </>
          )}
        </article>
      </section>

      <section className="agent-card">
        <h2>{"Incoming Delivery Assignments"}</h2>
        <div className="agent-table-wrap">
          <table className="agent-table">
            <thead>
              <tr>
                <th>{"Order ID"}</th>
                <th>{"Pickup Station"}</th>
                <th>{"Customer Name"}</th>
                <th>{"Package"}</th>
                <th>{"Drop-off Address"}</th>
                <th>{"Accept Route"}</th>
                <th>{"Refuse Assignment"}</th>
                <th>{"View Details"}</th>
              </tr>
            </thead>
            <tbody>
              {incomingRequests.map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{getSupplierName(order, "Warehouse Center")}</td>
                  <td>{order.farmerName || "-"}</td>
                  <td>{toDisplayProduct("Standard Package")}</td>
                  <td>{order.farmerDeliveryLocation || "-"}</td>
                  <td><Button className="btn square" onClick={() => handleAccept(order.orderId)}>{"Accept Route"}</Button></td>
                  <td><Button className="btn square" onClick={() => handleReject(order.orderId)}>{"Refuse Assignment"}</Button></td>
                  <td><Button className="btn square" onClick={() => handleViewDetails(order.orderId)}>{"View Details"}</Button></td>
                </tr>
              ))}
              {!incomingRequests.length && (
                <tr><td colSpan={8} className="agent-empty">{"No incoming delivery assignments pending."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="agent-card">
        <h2>{"Active Target"}</h2>
        <div className="agent-table-wrap">
          <table className="agent-table">
            <thead>
              <tr>
                <th>{"Order ID"}</th>
                <th>{"Farmer"}</th>
                <th>{"Pickup Location"}</th>
                <th>{"Status Tracker"}</th>
                <th>{"Payment Tracking"}</th>
                <th>{"Action Hub"}</th>
                <th>{"GPS Navigate"}</th>
              </tr>
            </thead>
            <tbody>
              {acceptedOrders.map((order) => {
                const status = normalizeStatus(order.status);
                const action = ACTION_BY_STATUS[status];
                const isCod = (order.paymentMethod || "").toLowerCase() === "cod";
                const isPaid = (order.paymentStatus || "").toUpperCase() === "PAID";
                return (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.farmerName || "-"}</td>
                    <td>{getSupplierName(order, "Warehouse Center")}</td>
                    <td><span className={`agent-status agent-status--${status.toLowerCase()}`}>{status}</span></td>
                    <td>
                      <span className={`agent-payment-badge ${isPaid ? "agent-payment-badge--paid" : "agent-payment-badge--pending"}`}>
                        {isCod ? "C.O.D." : "Prepaid"} - {isPaid ? "PAID" : "DUE"}
                      </span>
                      {isCod && !isPaid && status === "DELIVERED" && (
                        <Button className="btn square agent-collect-btn" onClick={() => collectCodPayment(order.orderId)}>
                          {"Collect Money"}
                        </Button>
                      )}
                    </td>
                    <td>
                      {action ? (
                        <Button className="btn square" onClick={() => updateStatus(order.orderId, action)}>
                          {action === "pickup"
                            ? "Confirm Pick Up"
                            : action === "out-for-delivery"
                              ? "Depart for Execution"
                              : "Mark as Delivered"}
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <Button className="btn square" onClick={() => handleNavigate(order)}>
                        {"Open GPS Navigation"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!acceptedOrders.length && (
                <tr><td colSpan={7} className="agent-empty">{"You have zero active deliveries underway."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="agent-card">
        <h2>{"Completed Deliveries Archive"}</h2>
        <div className="agent-table-wrap">
          <table className="agent-table">
            <thead>
              <tr>
                <th>{"Order ID"}</th>
                <th>{"Farmer"}</th>
                <th>{"Payment Tracking"}</th>
                <th>{"Date Delivered"}</th>
                <th>{"Photo Proof"}</th>
              </tr>
            </thead>
            <tbody>
              {historyOrders.map((order) => {
                const isCod = (order.paymentMethod || "").toLowerCase() === "cod";
                const isPaid = (order.paymentStatus || "").toUpperCase() === "PAID";
                return (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.farmerName || "-"}</td>
                    <td>
                      <span className={`agent-payment-badge ${isPaid ? "agent-payment-badge--paid" : "agent-payment-badge--pending"}`}>
                        {isCod ? "C.O.D." : "Prepaid"} - {isPaid ? "PAID" : "DUE"}
                      </span>
                      {isCod && !isPaid && (
                        <Button className="btn square agent-collect-btn" onClick={() => collectCodPayment(order.orderId)}>
                          {"Settle Cash"}
                        </Button>
                      )}
                    </td>
                    <td>
                      {deliveredAtByOrder[order.orderId]
                        ? new Date(deliveredAtByOrder[order.orderId]).toLocaleString(locale)
                        : "-"}
                    </td>
                    <td>
                      {proofPreviewByOrder[order.orderId] ? (
                        <a href={proofPreviewByOrder[order.orderId]} target="_blank" rel="noreferrer">
                          {"Review Photo"}
                        </a>
                      ) : (
                        <span>{"No Photo Taken"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!historyOrders.length && (
                <tr><td colSpan={5} className="agent-empty">{"Your delivery archive is currently empty."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {loading && (
        <div className="agent-loading">
          <p>{"Fetching dispatch data..."}</p>
        </div>
      )}
      {!loading && !orders.length && (
        <div className="agent-loading">
          <p>{"Dispatch empty. Take a break!"}</p>
        </div>
      )}

      <footer className="agent-footer">
        <div>
          <strong>{"AgriEase"}</strong> (c) {new Date().getFullYear()} {"Delivery Management Logistics"}
        </div>
        <div>{"Keep driving safe."}</div>
      </footer>
    </motion.div>
  );
}
