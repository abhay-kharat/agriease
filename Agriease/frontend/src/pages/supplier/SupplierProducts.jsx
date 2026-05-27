import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { uploadToCloudinary } from "../../services/cloudinary";
import { getSafeImageUrl, onImageError } from "../../utils/imageUtils";
import { useLanguage } from "../../context/LanguageContext";

export default function SupplierProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "PRODUCT",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const fetchProducts = useCallback(() => {
    api
      .get("/supplier/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error(t("messages.loadProductsError")));
  }, [t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        toast.info(t("messages.uploadingImage"));
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const dataToSend = { ...formData, imageUrl };

      if (editingId) {
        await api.put(`/supplier/products/${editingId}`, dataToSend);
        toast.success(t("supplier.products.toast.updated"));
      } else {
        await api.post("/supplier/products", dataToSend);
        toast.success(t("supplier.products.toast.added"));
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        type: "PRODUCT",
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error("Product save error:", error);
      toast.error(t("supplier.products.toast.saveError"));
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      imageUrl: product.imageUrl,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("supplier.products.confirm.delete"))) {
      return;
    }
    try {
      await api.delete(`/supplier/products/${id}`);
      toast.success(t("supplier.products.toast.deleted"));
      fetchProducts();
    } catch {
      toast.error(t("supplier.products.toast.deleteError"));
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        [product.name, product.description, product.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query.toLowerCase()))
      ),
    [products, query]
  );

  return (
    <motion.div className="secondary-page market-v2 supplier-manage-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div className="page-hero page-hero--supplier-products page-hero--market" variants={fadeUp}>
        <h1>{t("supplier.products.title")}</h1>
        <p>{t("supplier.products.subtitle")}</p>
      </motion.div>

      <motion.div className="market-v2-top" variants={fadeUp}>
        <div className="market-v2-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("supplier.products.searchPlaceholder") || "Search products"}
          />
        </div>
      </motion.div>

      <div className="page-header secondary-toolbar market-v2-head supplier-manage-v2__head">
        <div>
          <h2 className="dash-title">{t("supplier.products.catalogTitle")} ({filteredProducts.length})</h2>
          <p className="dash-subtitle">{t("supplier.products.catalogSubtitle")}</p>
        </div>
        <Button
          className="market-v2-cart-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              price: "",
              type: "PRODUCT",
              imageUrl: "",
            });
            setImageFile(null);
            setImagePreview(null);
          }}
        >
          {showForm ? t("common.actions.cancel") : t("common.actions.addProduct")}
        </Button>
      </div>

      {showForm && (
        <motion.div className="product-card secondary-panel supplier-manage-v2__form" variants={fadeUp}>
          <h3>{editingId ? t("supplier.products.form.editTitle") : t("supplier.products.form.addTitle")}</h3>
          <form onSubmit={handleSubmit} className="form-row">
            <div className="form-group">
              <label>{t("supplier.products.form.productName")} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
                placeholder={t("supplier.products.form.productNamePlaceholder")}
              />
            </div>

            <div className="form-group">
              <label>{t("common.labels.description")}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder={t("supplier.products.form.descriptionPlaceholder")}
              />
            </div>

            <div className="form-group">
              <label>{t("supplier.products.form.price")} (INR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>{t("supplier.products.form.type")}</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input"
              >
                <option value="PRODUCT">{t("common.labels.product")}</option>
                <option value="CROP">{t("supplier.products.types.cropSeeds")}</option>
                <option value="FERTILIZER">{t("supplier.products.types.fertilizer")}</option>
                <option value="PESTICIDE">{t("supplier.products.types.pesticide")}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("supplier.products.form.image")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input"
              />
              {imagePreview && (
                <img
                  src={getSafeImageUrl(imagePreview, "product")}
                  alt="Preview"
                  onError={onImageError("product")}
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>

            <Button type="submit" className="btn primary square">
              {editingId ? t("common.actions.updateProduct") : t("common.actions.addProduct")}
            </Button>
          </form>
        </motion.div>
      )}

      <motion.div className="market-v2-grid" variants={staggerContainer}>
        {filteredProducts.length === 0 && (
          <p className="market-v2-muted" style={{ gridColumn: "1 / -1" }}>
            {t("supplier.products.empty")}
          </p>
        )}
        {filteredProducts.map((product, index) => (
          <motion.article key={product.id} className="market-v2-card" variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }}>
            <div className="market-v2-card-image">
              <img
                src={getSafeImageUrl(product.imageUrl, "product")}
                alt={product.name}
                loading="lazy"
                onError={onImageError("product")}
              />
              <span className="market-v2-ribbon">{index % 2 === 0 ? product.type : "Catalog"}</span>
            </div>
            <div className="market-v2-card-body">
              <div className="market-v2-card-top">
                <h4>{product.name}</h4>
                <strong>INR {product.price}</strong>
              </div>
              <p>{product.description || t("supplier.products.noDescription")}</p>
              <div className="market-v2-card-meta">
                <span>{product.type}</span>
              </div>
              <div className="supplier-manage-v2__actions">
                <Button className="btn secondary square" onClick={() => handleEdit(product)}>
                  {t("common.actions.edit")}
                </Button>
                <Button className="btn secondary square supplier-manage-v2__delete" onClick={() => handleDelete(product.id)}>
                  {t("common.actions.delete")}
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.div>
  );
}
