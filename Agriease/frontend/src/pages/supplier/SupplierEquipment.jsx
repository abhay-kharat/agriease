import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { uploadToCloudinary } from "../../services/cloudinary";
import { getSafeImageUrl, onImageError } from "../../utils/imageUtils";
import { useLanguage } from "../../context/LanguageContext";

export default function SupplierEquipment() {
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dailyRate: "",
    available: true,
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

  const fetchEquipment = useCallback(() => {
    api
      .get("/supplier/equipment")
      .then((res) => setEquipment(res.data))
      .catch(() => toast.error(t("messages.loadEquipmentError")));
  }, [t]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
        await api.put(`/supplier/equipment/${editingId}`, dataToSend);
        toast.success(t("supplier.equipment.toast.updated"));
      } else {
        await api.post("/supplier/equipment", dataToSend);
        toast.success(t("supplier.equipment.toast.added"));
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        dailyRate: "",
        available: true,
        imageUrl: "",
      });
      setImageFile(null);
      setImagePreview(null);
      fetchEquipment();
    } catch (error) {
      console.error("Equipment save error:", error);
      toast.error(t("supplier.equipment.toast.saveError"));
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      dailyRate: item.dailyRate,
      available: item.available,
      imageUrl: item.imageUrl,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("supplier.equipment.confirm.delete"))) {
      return;
    }
    try {
      await api.delete(`/supplier/equipment/${id}`);
      toast.success(t("supplier.equipment.toast.deleted"));
      fetchEquipment();
    } catch {
      toast.error(t("supplier.equipment.toast.deleteError"));
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      // Find the equipment item
      const item = equipment.find(eq => eq.id === id);
      if (!item) {
        toast.error(t("supplier.equipment.toast.notFound"));
        return;
      }

      // Send complete data with updated availability
      const updatedData = {
        name: item.name,
        description: item.description,
        dailyRate: item.dailyRate,
        imageUrl: item.imageUrl,
        available: !currentStatus
      };

      console.log("Updating equipment availability:", { id, updatedData });
      const response = await api.put(`/supplier/equipment/${id}`, updatedData);
      console.log("Update response:", response.data);
      
      toast.success(t("supplier.equipment.toast.availabilityUpdated"));
      fetchEquipment();
    } catch (error) {
      console.error("Toggle availability error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error(t("messages.sessionExpired"));
      } else {
        toast.error(error.response?.data?.message || t("supplier.equipment.toast.availabilityError"));
      }
    }
  };

  const filteredEquipment = useMemo(
    () =>
      equipment.filter((item) =>
        [item.name, item.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query.toLowerCase()))
      ),
    [equipment, query]
  );

  return (
    <motion.div className="secondary-page market-v2 supplier-manage-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div className="page-hero page-hero--supplier-equipment page-hero--market" variants={fadeUp}>
        <h1>{t("supplier.equipment.title")}</h1>
        <p>{t("supplier.equipment.subtitle")}</p>
      </motion.div>

      <motion.div className="market-v2-top" variants={fadeUp}>
        <div className="market-v2-search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("supplier.equipment.searchPlaceholder") || "Search equipment"}
          />
        </div>
      </motion.div>

      <div className="page-header secondary-toolbar market-v2-head supplier-manage-v2__head">
        <div>
          <h2 className="dash-title">{t("supplier.equipment.fleetTitle")} ({filteredEquipment.length})</h2>
          <p className="dash-subtitle">{t("supplier.equipment.fleetSubtitle")}</p>
        </div>
        <Button
          className="market-v2-cart-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              dailyRate: "",
              available: true,
              imageUrl: "",
            });
            setImageFile(null);
            setImagePreview(null);
          }}
        >
          {showForm ? t("common.actions.cancel") : t("common.actions.addEquipment")}
        </Button>
      </div>

      {showForm && (
        <motion.div className="product-card secondary-panel supplier-manage-v2__form" variants={fadeUp}>
          <h3>{editingId ? t("supplier.equipment.form.editTitle") : t("supplier.equipment.form.addTitle")}</h3>
          <form onSubmit={handleSubmit} className="form-row">
            <div className="form-group">
              <label>{t("supplier.equipment.form.name")} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
                placeholder={t("supplier.equipment.form.namePlaceholder")}
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
                placeholder={t("supplier.equipment.form.descriptionPlaceholder")}
              />
            </div>

            <div className="form-group">
              <label>{t("supplier.equipment.form.dailyRate")} (INR) *</label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                className="input"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>{t("supplier.equipment.form.image")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input"
              />
              {imagePreview && (
                <img
                  src={getSafeImageUrl(imagePreview, "equipment")}
                  alt="Preview"
                  onError={onImageError("equipment")}
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

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                {t("supplier.equipment.form.availableForRent")}
              </label>
            </div>

            <Button type="submit" className="btn primary square">
              {editingId ? t("common.actions.updateEquipment") : t("common.actions.addEquipment")}
            </Button>
          </form>
        </motion.div>
      )}

      <motion.div className="market-v2-grid" variants={staggerContainer}>
        {filteredEquipment.length === 0 && (
          <p className="market-v2-muted" style={{ gridColumn: "1 / -1" }}>
            {t("supplier.equipment.empty")}
          </p>
        )}
        {filteredEquipment.map((item, index) => (
          <motion.article key={item.id} className="market-v2-card" variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }}>
            <div className="market-v2-card-image">
              <img
                src={getSafeImageUrl(item.imageUrl, "equipment")}
                alt={item.name}
                loading="lazy"
                onError={onImageError("equipment")}
              />
              <span className="market-v2-ribbon">{index % 2 === 0 ? "Fleet" : "Rental"}</span>
            </div>
            <div className="market-v2-card-body">
              <div className="market-v2-card-top">
                <h4>{item.name}</h4>
                <strong>INR {item.dailyRate} / day</strong>
              </div>
              <p>{item.description || t("supplier.equipment.noDescription")}</p>
              <div className="market-v2-card-meta">
                <span>{item.available ? t("common.labels.available") : t("common.labels.unavailable")}</span>
              </div>
              <div className="supplier-manage-v2__actions supplier-manage-v2__actions--stack">
                <Button className="btn secondary square" onClick={() => handleEdit(item)}>
                  {t("common.actions.edit")}
                </Button>
                <Button className="btn secondary square" onClick={() => toggleAvailability(item.id, item.available)}>
                  {item.available ? t("common.actions.markUnavailable") : t("common.actions.markAvailable")}
                </Button>
                <Button className="btn secondary square supplier-manage-v2__delete" onClick={() => handleDelete(item.id)}>
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
