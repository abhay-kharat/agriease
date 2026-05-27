import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { getSafeImageUrl, onImageError } from "../../utils/imageUtils";
import { useLanguage } from "../../context/LanguageContext";

const EQUIPMENT_CACHE_KEY = "agriease-equipment-cache-v1";

function Tools() {
  const [tools, setTools] = useState([]);
  const [query, setQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const { addToolBooking } = useCart();
  const controllerRef = useRef();
  const { t, language } = useLanguage();

  const hydrateFromCache = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = window.sessionStorage.getItem(EQUIPMENT_CACHE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed?.data)) {
        setTools(parsed.data);
        setLastSynced(parsed.timestamp || null);
      }
    } catch (cacheError) {
      console.warn("Failed to hydrate equipment cache", cacheError);
    }
  }, []);

  const fetchEquipment = useCallback(async () => {
    controllerRef.current?.abort?.();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/farmer/equipment", { signal: controller.signal });
      const payload = Array.isArray(response.data) ? response.data : [];
      setTools(payload);
      const timestamp = Date.now();
      setLastSynced(timestamp);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          EQUIPMENT_CACHE_KEY,
          JSON.stringify({ data: payload, timestamp })
        );
      }
    } catch (err) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return;
      }
      console.error("Failed to load equipment", err);
      setError(t("messages.loadEquipmentError"));
      toast.error(t("messages.loadEquipmentError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    hydrateFromCache();
    fetchEquipment();
    return () => controllerRef.current?.abort?.();
  }, [fetchEquipment, hydrateFromCache]);

  const handleAddToCart = (tool) => {
    if (!startDate || !endDate) {
      toast.error(t("messages.selectRentalDates"));
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error(t("messages.endDateInvalid"));
      return;
    }
    addToolBooking(tool, startDate, endDate);
    toast.success(t("messages.equipmentReserved"));
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const filteredTools = useMemo(() => {
    return tools
      .filter((item) => {
        const matchesQuery = [item.name, item.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query.toLowerCase()));
        const matchesAvailability = showAvailableOnly ? Boolean(item.available) : true;
        return matchesQuery && matchesAvailability;
      })
      .sort((a, b) => Number(a.dailyRate || 0) - Number(b.dailyRate || 0));
  }, [tools, query, showAvailableOnly]);

  return (
    <motion.div className="secondary-page market-v2 catalog-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div
        className="page-hero page-hero--market"
        style={{ backgroundImage: "url('/images/tools.jpg')" }}
        variants={fadeUp}
      >
        <h1>{t("farmer.tools.title")}</h1>
        <p>{t("farmer.tools.subtitle")}</p>
      </motion.div>

      <motion.div className="market-v2-top" variants={fadeUp}>
        <div className="market-v2-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("farmer.tools.searchPlaceholder") || "Search equipment"}
          />
        </div>
        <div className="market-v2-tabs">
          <button
            type="button"
            className={showAvailableOnly ? "is-active" : ""}
            onClick={() => setShowAvailableOnly((prev) => !prev)}
          >
            {showAvailableOnly ? t("farmer.tools.available") : t("farmer.tools.showAll") || "Show all"}
          </button>
        </div>
      </motion.div>

      {lastSynced && (
        <motion.p className="data-sync-meta" variants={fadeUp}>
          {t("common.labels.lastSynced")}: {new Date(lastSynced).toLocaleTimeString(language === "mr" ? "mr-IN" : undefined, { hour: "2-digit", minute: "2-digit" })}
        </motion.p>
      )}

      {error && <motion.p className="inline-error" variants={fadeUp}>{error}</motion.p>}

      <div className="market-v2-layout market-v2-layout--single">
        <motion.aside className="market-v2-filters" variants={fadeUp}>
          <h3>{t("farmer.tools.bookingWindow") || "Booking Window"}</h3>
          <div className="market-v2-filter-group">
            <label>{t("common.labels.startDate") || "Start Date"}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input--enhanced" />
          </div>
          <div className="market-v2-filter-group">
            <label>{t("common.labels.endDate") || "End Date"}</label>
            <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="input input--enhanced" />
          </div>
          <Button className="btn ghost" onClick={fetchEquipment} loading={isLoading} type="button">
            {t("farmer.home.refresh")}
          </Button>
        </motion.aside>

        <section className="market-v2-main">
          <motion.div className="market-v2-head" variants={fadeUp}>
            <div>
              <h1>{t("farmer.tools.title")}</h1>
              <p>{filteredTools.length} equipment options</p>
            </div>
          </motion.div>

          <motion.div className="market-v2-grid" variants={staggerContainer}>
            {isLoading && tools.length === 0 && <p className="market-v2-muted">{t("farmer.tools.loading")}</p>}
            {!isLoading && filteredTools.length === 0 && !error && <p className="market-v2-muted">{t("farmer.tools.empty")}</p>}

            {filteredTools.map((p, index) => (
              <motion.article
                key={p.id}
                className="market-v2-card"
                variants={fadeUp}
                whileHover={{ scale: 1.015, y: -4 }}
              >
                <div className="market-v2-card-image">
                  <img
                    src={getSafeImageUrl(p.imageUrl, "equipment")}
                    alt={p.name}
                    loading="lazy"
                    onError={onImageError("equipment")}
                  />
                  <span className="market-v2-ribbon">{index % 2 === 0 ? "Rental Ready" : "Verified Supplier"}</span>
                </div>
                <div className="market-v2-card-body">
                  <div className="market-v2-card-top">
                    <h4>{p.name}</h4>
                    <strong>INR {p.dailyRate} / day</strong>
                  </div>
                  <p>{p.description || "No description"}</p>
                  {p.supplier && (
                    <div className="market-v2-card-meta">
                      <span>{p.supplier.businessName || p.supplier.name}</span>
                      <small>Rating: {p.supplier.rating ?? 0}</small>
                    </div>
                  )}
                  <Button
                    className="market-v2-cart-btn"
                    onClick={() => handleAddToCart(p)}
                    disabled={!p.available}
                    style={{ opacity: p.available ? 1 : 0.5, cursor: p.available ? "pointer" : "not-allowed" }}
                  >
                    {p.available ? t("common.actions.addToCart") : t("farmer.tools.unavailable")}
                  </Button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}

export default Tools;
