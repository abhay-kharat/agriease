import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";
import { getSafeImageUrl, onImageError } from "../../utils/imageUtils";
import { useLanguage } from "../../context/LanguageContext";

function Crops() {
  const [crops, setCrops] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const { addCrop } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    const isCropType = (value) => (value || "").toUpperCase() === "CROP";
    const loadCrops = async () => {
      try {
        const res = await api.get("/farmer/products");
        const list = Array.isArray(res.data) ? res.data : [];
        const cropProducts = list.filter((p) => isCropType(p.type));
        if (cropProducts.length > 0) {
          setCrops(cropProducts);
          return;
        }

        const fallback = await api.get("/products");
        const fallbackList = Array.isArray(fallback.data) ? fallback.data : [];
        setCrops(fallbackList.filter((p) => isCropType(p.type)));
      } catch (err) {
        console.error("Failed to load crops", err);
        const products = JSON.parse(localStorage.getItem("products")) || [];
        setCrops(products.filter((p) => isCropType(p.type)));
      }
    };

    loadCrops();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const filteredCrops = useMemo(() => {
    const searched = crops.filter((item) =>
      [item.name, item.type, item.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query.toLowerCase()))
    );

    return [...searched].sort((a, b) => {
      if (sortBy === "price") return Number(a.price || 0) - Number(b.price || 0);
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [crops, query, sortBy]);

  return (
    <motion.div className="secondary-page market-v2 catalog-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div
        className="page-hero page-hero--market"
        style={{ backgroundImage: "url('/images/crops.jpg')" }}
        variants={fadeUp}
      >
        <h1>{t("farmer.crops.title")}</h1>
        <p>{t("farmer.crops.subtitle")}</p>
      </motion.div>

      <motion.div className="market-v2-top" variants={fadeUp}>
        <div className="market-v2-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("farmer.crops.searchPlaceholder") || "Search crops"}
          />
        </div>
      </motion.div>

      <div className="market-v2-layout market-v2-layout--single">
        <section className="market-v2-main">
          <motion.div className="market-v2-head" variants={fadeUp}>
            <div>
              <h1>{t("farmer.crops.title")}</h1>
              <p>{filteredCrops.length} items available</p>
            </div>
            <div className="market-v2-sort">
              <label htmlFor="crop-sort">Sort</label>
              <select id="crop-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </motion.div>

          <motion.div className="market-v2-grid" variants={staggerContainer}>
            {filteredCrops.length === 0 && <p className="market-v2-muted">{t("farmer.crops.empty")}</p>}

            {filteredCrops.map((p, index) => (
              <motion.article
                key={p.id}
                className="market-v2-card"
                variants={fadeUp}
                whileHover={{ scale: 1.015, y: -4 }}
              >
                <div className="market-v2-card-image">
                  <img
                    src={getSafeImageUrl(p.imageUrl, "crop")}
                    alt={p.name}
                    loading="lazy"
                    onError={onImageError("crop")}
                  />
                  <span className="market-v2-ribbon">{index % 2 === 0 ? "Fresh Stock" : "Top Rated"}</span>
                </div>
                <div className="market-v2-card-body">
                  <div className="market-v2-card-top">
                    <h4>{p.name}</h4>
                    <strong>INR {p.price}</strong>
                  </div>
                  {p.supplier && (
                    <div className="market-v2-card-meta">
                      <span>{p.supplier.name || "Supplier"}</span>
                      <small>Rating: {p.supplier.rating ?? 0}</small>
                    </div>
                  )}
                  <Button className="market-v2-cart-btn" onClick={() => addCrop(p)}>
                    {t("common.actions.addToCart")}
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

export default Crops;
