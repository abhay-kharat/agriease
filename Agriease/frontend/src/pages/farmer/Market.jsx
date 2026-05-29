import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import { useCart } from "../../context/CartContext";
import { getSafeImageUrl, onImageError } from "../../utils/imageUtils";
import { useLanguage } from "../../context/LanguageContext";

export default function Market() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [priceLimit, setPriceLimit] = useState(5000);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const { addProduct } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/farmer/products");
        const farmerProducts = Array.isArray(res.data) ? res.data : [];
        if (farmerProducts.length > 0) {
          setProducts(farmerProducts);
          return;
        }
        const fallback = await api.get("/products");
        setProducts(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const getCategoryLabel = (product) => {
    return (
      product.category ||
      product.type ||
      product.productType ||
      product.productCategory ||
      t("farmer.market.other")
    );
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => getCategoryLabel(product))
          .filter(Boolean)
      )
    );

    return uniqueCategories;
  }, [products]);

  const maxProductPrice = useMemo(() => {
    const values = products.map((product) => Number(product.price || 0)).filter((value) => value > 0);
    if (!values.length) {
      return 5000;
    }
    return Math.max(5000, Math.ceil(Math.max(...values) / 100) * 100);
  }, [products]);

  useEffect(() => {
    setPriceLimit(maxProductPrice);
  }, [maxProductPrice]);

  const isInStock = (product) => {
    if (typeof product.inStock === "boolean") {
      return product.inStock;
    }
    if (typeof product.available === "boolean") {
      return product.available;
    }
    if (typeof product.stock === "number") {
      return product.stock > 0;
    }
    if (typeof product.quantity === "number") {
      return product.quantity > 0;
    }
    return true;
  };

  const visibleProducts = useMemo(() => {
    let nextProducts = [...products];

    if (selectedCategories.length > 0) {
      nextProducts = nextProducts.filter(
        (product) => selectedCategories.includes(getCategoryLabel(product))
      );
    }

    if (inStockOnly) {
      nextProducts = nextProducts.filter((product) => isInStock(product));
    }

    nextProducts = nextProducts.filter((product) => Number(product.price || 0) <= priceLimit);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      nextProducts = nextProducts.filter((product) => {
        const supplierName = product.supplier?.name || "";
        const text = `${product.name || ""} ${product.description || ""} ${supplierName} ${getCategoryLabel(product)}`;
        return text.toLowerCase().includes(query);
      });
    }

    if (sortBy === "price-low-high") {
      nextProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high-low") {
      nextProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name-asc") {
      nextProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "newest") {
      nextProducts.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    } else {
      nextProducts.sort((a, b) => Number(b.supplier?.rating || 0) - Number(a.supplier?.rating || 0));
    }

    return nextProducts;
  }, [products, selectedCategories, sortBy, inStockOnly, priceLimit, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, sortBy, inStockOnly, priceLimit, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleProducts.slice(start, start + pageSize);
  }, [visibleProducts, currentPage]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const getRibbon = (index) => {
    const ribbons = ["Premium", "Bestseller", "New Tech"];
    return ribbons[index % ribbons.length];
  };

  return (
    <motion.div className="secondary-page market-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div className="market-v2-top" variants={fadeUp}>
        <div className="market-v2-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search marketplace"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="market-v2-tabs">
          <button type="button" className="is-active">Inventory</button>
          <button type="button">Logistics</button>
          <button type="button">Analytics</button>
        </div>
      </motion.div>

      <div className="market-v2-layout">
        <motion.aside className="market-v2-filters" variants={fadeUp}>
          <h3>
            <span className="material-symbols-outlined">filter_list</span>
            Filters
          </h3>

          <div className="market-v2-filter-group">
            <label>Category</label>
            <div className="market-v2-checks">
              {categories.map((category) => (
                <label key={category} className="market-v2-check-row">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="market-v2-muted">No categories found</p>}
            </div>
          </div>

          <div className="market-v2-filter-group">
            <label>Price Range</label>
            <input
              type="range"
              min="0"
              max={maxProductPrice}
              value={priceLimit}
              onChange={(event) => setPriceLimit(Number(event.target.value))}
            />
            <div className="market-v2-price-row">
              <span>INR 0</span>
              <span>INR {priceLimit.toLocaleString()}</span>
            </div>
          </div>

          <div className="market-v2-stock-toggle">
            <span>In Stock Only</span>
            <label className="market-v2-switch">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
              />
              <span />
            </label>
          </div>
        </motion.aside>

        <section className="market-v2-main">
          <motion.div className="market-v2-head" variants={fadeUp}>
            <div>
              <h1>{t("farmer.market.title")}</h1>
              <p>{t("farmer.market.subtitle")}</p>
            </div>
            <div className="market-v2-sort">
              <label htmlFor="market-sort">Sort by:</label>
              <select id="market-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="popularity">Popularity</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-asc">Name</option>
                <option value="newest">Newest Arrival</option>
              </select>
            </div>
          </motion.div>

          <motion.div className="market-v2-grid" variants={staggerContainer}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : currentProducts.length === 0 ? (
              <motion.div className="empty-state" style={{ gridColumn: "1 / -1" }} variants={fadeUp}>
                {t("farmer.market.empty")}
              </motion.div>
            ) : (
              currentProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  className="market-v2-card"
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                >
                  <div className="market-v2-card-image">
                    <img
                      src={getSafeImageUrl(product.imageUrl, "product")}
                      alt={product.name}
                      loading="lazy"
                      onError={onImageError("product")}
                    />
                    <span className="market-v2-ribbon">{getRibbon(index)}</span>
                  </div>

                  <div className="market-v2-card-body">
                    <div className="market-v2-card-top">
                      <h4>{product.name}</h4>
                      <strong>INR {Number(product.price || 0).toLocaleString()}</strong>
                    </div>

                    <p>{product.description || t("farmer.market.other")}</p>

                    <div className="market-v2-card-meta">
                      <span>
                        ★ {product.supplier?.rating?.toFixed(1) || "N/A"}
                      </span>
                      <small>{getCategoryLabel(product)}</small>
                    </div>

                    <button type="button" className="market-v2-cart-btn" onClick={() => addProduct(product)}>
                      <span className="material-symbols-outlined">shopping_cart</span>
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </motion.div>

          <motion.div className="market-v2-pagination" variants={fadeUp}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).slice(0, 6).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  type="button"
                  className={page === currentPage ? "is-active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </motion.div>
        </section>
      </div>

      <button
        type="button"
        className="market-v2-fab"
        aria-label="Open cart"
        onClick={() => navigate("/farmer/cart")}
      >
        <span className="material-symbols-outlined">add_shopping_cart</span>
      </button>
    </motion.div>
  );
}
