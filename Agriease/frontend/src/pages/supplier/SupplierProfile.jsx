import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { getStoredThemePreference, setStoredThemePreference } from "../../utils/userPreferences";

export default function SupplierProfile() {
  const profileSections = ["personal", "security", "credentials", "preferences", "notifications"];
  const { t } = useLanguage();
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessType: "",
    profilePhoto: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [businessStats, setBusinessStats] = useState({
    products: 0,
    equipment: 0,
    totalSales: 0,
    totalOrders: 0,
  });
  const [statsError, setStatsError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [themePreference, setThemePreference] = useState(() => getStoredThemePreference());
  const [inventoryView, setInventoryView] = useState("Stock Overview");

  useEffect(() => {
    setThemePreference(theme);
  }, [theme]);

  const handleThemePreferenceChange = (nextTheme) => {
    setThemePreference(nextTheme);
    setTheme(nextTheme);
    setStoredThemePreference(nextTheme);
  };

  const loadProfile = useCallback(async () => {
    try {
      console.log("Loading profile from backend...");
      const response = await api.get("/supplier/profile");
      if (response.data) {
        const userData = response.data;
        console.log("Profile loaded:", userData);
        updateUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          businessName: userData.businessName || "",
          businessType: userData.businessType || "",
          profilePhoto: userData.profilePhoto || "",
        });
        if (userData.profilePhoto) {
          setPhotoPreview(userData.profilePhoto);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Don't show error toast on initial load
    }
  }, [updateUser]);

  useEffect(() => {
    // Load fresh profile data from backend on mount
    loadProfile();
  }, [loadProfile]); // Now safe to include loadProfile

  const loadBusinessStats = useCallback(async () => {
    try {
      setStatsError("");
      const [productsRes, equipmentRes, ordersRes] = await Promise.all([
        api.get("/supplier/products"),
        api.get("/supplier/equipment"),
        api.get("/supplier/orders"),
      ]);

      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const equipment = Array.isArray(equipmentRes.data) ? equipmentRes.data : [];
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      const totalSales = orders.reduce((sum, order) => {
        const status = (order.status || "").toUpperCase();
        if (status === "DELIVERED" || status === "COMPLETED") {
          return sum + Number(order.totalAmount || 0);
        }
        return sum;
      }, 0);

      setBusinessStats({
        products: products.length,
        equipment: equipment.length,
        totalSales,
        totalOrders: orders.length,
      });
    } catch (error) {
      console.error("Failed to load business stats", error);
      setStatsError(t("supplier.profile.statsError"));
    }
  }, [t]);

  useEffect(() => {
    loadBusinessStats();
  }, [loadBusinessStats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current?.target?.id) {
          setActiveSection(current.target.id);
        }
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -58% 0px" }
    );

    profileSections.forEach((sectionId) => {
      const node = document.getElementById(sectionId);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Update form data when user changes
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        profilePhoto: user.profilePhoto || "",
      });
      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("messages.imageTooLarge"));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t("messages.imageType"));
        return;
      }

      setUploadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setFormData({
          ...formData,
          profilePhoto: base64String,
        });
        setUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast.error(t("messages.imageReadError"));
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData({
      ...formData,
      profilePhoto: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Form submitted, saving profile...");
    console.log("Form data being sent:", { ...formData, profilePhoto: formData.profilePhoto ? 'base64 image...' : 'none' });
    
    try {
      const response = await api.put("/supplier/profile", formData);
      
      console.log("Server response:", response.data);
      
      // Update user data in localStorage and context
      if (response.data.user) {
        updateUser(response.data.user);
        // Reload fresh data from backend
        await loadProfile();
      } else if (response.data) {
        // If response doesn't have user property, use the response data directly
        updateUser(response.data);
        await loadProfile();
      }
      
      toast.success(t("messages.profileUpdated"));
      setIsEditing(false);
      loadBusinessStats();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || t("messages.profileUpdateError"));
    }
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This will remove your profile and related data. This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeletingAccount(true);
      try {
        await api.delete("/api/user/account");
      } catch (error) {
        if (error?.response?.status === 404) {
          await api.delete("/user/account");
        } else {
          throw error;
        }
      }
      toast.success(t("supplier.profile.accountDeleted"));
      logout();
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error?.response?.data?.message || t("supplier.profile.deleteAccountFailed"));
    } finally {
      setDeletingAccount(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const getFirstName = () => {
    const parts = (formData.name || "").trim().split(/\s+/).filter(Boolean);
    return parts[0] || "";
  };

  const getLastName = () => {
    const parts = (formData.name || "").trim().split(/\s+/).filter(Boolean);
    return parts.slice(1).join(" ");
  };

  const handleNamePartChange = (part, value) => {
    const first = part === "first" ? value : getFirstName();
    const last = part === "last" ? value : getLastName();
    setFormData((prev) => ({
      ...prev,
      name: `${first} ${last}`.trim(),
    }));
  };

  const handleSectionNav = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  return (
    <motion.div className="secondary-page profile-v2" initial="hidden" animate="show" variants={staggerContainer}>
      <BackButton />
      <motion.div className="profile-v2-header" variants={fadeUp}>
        <h1>Supplier Account Settings</h1>
        <p>Manage your business profile, storefront identity, and account security.</p>
      </motion.div>

      <div className="profile-v2-layout">
        <motion.aside className="profile-v2-sidebar" variants={fadeUp}>
          <a href="#personal" className={activeSection === "personal" ? "is-active" : ""} onClick={(event) => handleSectionNav(event, "personal")}>
            <span className="material-symbols-outlined">person</span>
            <span>Personal Info</span>
          </a>
          <a href="#security" className={activeSection === "security" ? "is-active" : ""} onClick={(event) => handleSectionNav(event, "security")}>
            <span className="material-symbols-outlined">shield_person</span>
            <span>Security</span>
          </a>
          <a href="#credentials" className={activeSection === "credentials" ? "is-active" : ""} onClick={(event) => handleSectionNav(event, "credentials")}>
            <span className="material-symbols-outlined">verified</span>
            <span>Credentials</span>
          </a>
          <a href="#preferences" className={activeSection === "preferences" ? "is-active" : ""} onClick={(event) => handleSectionNav(event, "preferences")}>
            <span className="material-symbols-outlined">tune</span>
            <span>Preferences</span>
          </a>
          <a href="#notifications" className={activeSection === "notifications" ? "is-active" : ""} onClick={(event) => handleSectionNav(event, "notifications")}>
            <span className="material-symbols-outlined">notifications_active</span>
            <span>Notifications</span>
          </a>
        </motion.aside>

        <motion.div className="profile-v2-content" variants={staggerContainer}>
          <motion.section id="personal" className="profile-v2-panel" variants={fadeUp}>
            <div className="profile-v2-panel-head">
              <div>
                <h2>Personal Information</h2>
                <p>Update your photo, contact details, and business identity.</p>
              </div>

              {isEditing ? (
                <div className="profile-v2-actions-inline">
                  <Button type="submit" className="btn primary square" onClick={handleSubmit}>
                    {t("common.actions.saveChanges")}
                  </Button>
                  <Button
                    type="button"
                    className="btn secondary square"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                        address: user?.address || "",
                        businessName: user?.businessName || "",
                        businessType: user?.businessType || "",
                        profilePhoto: user?.profilePhoto || "",
                      });
                      setPhotoPreview(user?.profilePhoto || null);
                    }}
                  >
                    {t("common.actions.cancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="btn primary square"
                  onClick={() => setIsEditing(true)}
                >
                  {t("common.actions.editProfile")}
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-v2-form-grid">
              <div className="profile-v2-avatar-stack">
                <div className="profile-v2-avatar">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase() || "S"}</span>
                  )}
                </div>

                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="supplier-photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="supplier-photo-upload" className="profile-v2-photo-btn">
                      {uploadingPhoto ? t("messages.uploadingImage") : t("supplier.profile.changePhoto")}
                    </label>
                    {photoPreview && (
                      <button type="button" className="profile-v2-photo-btn danger" onClick={removePhoto}>
                        {t("supplier.profile.removePhoto")}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="profile-v2-fields">
                <div className="form-group form-group--enhanced">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={getFirstName()}
                    onChange={(event) => handleNamePartChange("first", event.target.value)}
                    disabled={!isEditing}
                    className="input input--enhanced"
                  />
                </div>

                <div className="form-group form-group--enhanced">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={getLastName()}
                    onChange={(event) => handleNamePartChange("last", event.target.value)}
                    disabled={!isEditing}
                    className="input input--enhanced"
                  />
                </div>

                <div className="form-group form-group--enhanced profile-v2-span-2">
                  <label>{t("common.labels.email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                    required
                  />
                </div>

                <div className="form-group form-group--enhanced">
                  <label>{t("common.labels.phoneNumber")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                  />
                </div>

                <div className="form-group form-group--enhanced">
                  <label>{t("common.labels.businessName")}</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                    placeholder={t("supplier.profile.businessNamePlaceholder")}
                  />
                </div>

                <div className="form-group form-group--enhanced profile-v2-span-2">
                  <label>{t("common.labels.address")}</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                    rows="2"
                  />
                </div>

                <div className="form-group form-group--enhanced profile-v2-span-2">
                  <label>{t("common.labels.businessType")}</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                  >
                    <option value="">{t("supplier.profile.selectBusinessType")}</option>
                    <option value="Equipment Rental">{t("supplier.profile.businessTypes.equipmentRental")}</option>
                    <option value="Seeds & Fertilizers">{t("supplier.profile.businessTypes.seedsAndFertilizers")}</option>
                    <option value="Pesticides">{t("supplier.profile.businessTypes.pesticides")}</option>
                    <option value="General Supplies">{t("supplier.profile.businessTypes.generalSupplies")}</option>
                    <option value="Other">{t("supplier.profile.businessTypes.other")}</option>
                  </select>
                </div>
              </div>
            </form>
          </motion.section>

          <motion.section id="credentials" className="profile-v2-credentials" variants={fadeUp}>
            <article className="profile-v2-credential-card green">
              <div className="profile-v2-credential-head">
                <span className="material-symbols-outlined">storefront</span>
                <small>Store Status</small>
              </div>
              <h3>{formData.businessName || "AgriEase Supplier"}</h3>
              <p>{formData.businessType || "General Supplies"}</p>
              <div className="profile-v2-meta-row">
                <span>Products Listed</span>
                <strong>{businessStats.products}</strong>
              </div>
              <div className="profile-v2-meta-row">
                <span>Equipment Listed</span>
                <strong>{businessStats.equipment}</strong>
              </div>
            </article>

            <article className="profile-v2-credential-card blue">
              <div className="profile-v2-credential-head">
                <span className="material-symbols-outlined">payments</span>
                <small>Business Performance</small>
              </div>
              <h3>Total Sales</h3>
              <p>{currencyFormatter.format(businessStats.totalSales)}</p>
              <div className="profile-v2-meta-row">
                <span>Total Orders</span>
                <strong>{businessStats.totalOrders}</strong>
              </div>
              <div className="profile-v2-meta-row">
                <span>Merchant Score</span>
                <strong>98/100</strong>
              </div>
            </article>
          </motion.section>

          <motion.section id="security" className="profile-v2-panel" variants={fadeUp}>
            <div className="profile-v2-panel-head">
              <div>
                <h2>Security and Privacy</h2>
                <p>Protect your supplier account and store data.</p>
              </div>
            </div>

            <div className="profile-v2-list-row">
              <div>
                <h4>Password Management</h4>
                <p>Update your login credentials from the auth flow</p>
              </div>
              <button
                type="button"
                className="profile-v2-text-btn"
                onClick={() => toast.info("Password change is available from the auth flow.")}
              >
                Change Password
              </button>
            </div>

            <div className="profile-v2-list-row">
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra verification layer to your supplier account</p>
              </div>
              <label className="market-v2-switch">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                />
                <span />
              </label>
            </div>
          </motion.section>

          <motion.section id="preferences" className="profile-v2-panel" variants={fadeUp}>
            <div className="profile-v2-panel-head">
              <div>
                <h2>Platform Preferences</h2>
                <p>Tailor your supplier dashboard experience.</p>
              </div>
            </div>

            <div className="profile-v2-preferences-grid">
              <div>
                <label>Dashboard Theme</label>
                <div className="profile-v2-toggle-group">
                  <button
                    type="button"
                    className={themePreference === "light" ? "is-active" : ""}
                    onClick={() => handleThemePreferenceChange("light")}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={themePreference === "dark" ? "is-active" : ""}
                    onClick={() => handleThemePreferenceChange("dark")}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <label>Inventory Default View</label>
                <select value={inventoryView} onChange={(event) => setInventoryView(event.target.value)}>
                  <option>Stock Overview</option>
                  <option>Category Split</option>
                  <option>Low Inventory Alerts</option>
                </select>
              </div>

              <div id="notifications">
                <label>Notifications</label>
                <div className="profile-v2-list-row compact">
                  <div>
                    <h4>Orders and stock updates</h4>
                    <p>Receive alerts for new orders and inventory activity</p>
                  </div>
                  <label className="market-v2-switch">
                    <input type="checkbox" defaultChecked />
                    <span />
                  </label>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section className="profile-v2-stats" variants={fadeUp}>
            <div className="profile-stats__header">
              <h3 className="profile-stats__title">{t("supplier.profile.businessStatistics")}</h3>
            </div>

            {statsError && <p className="profile-stats__error">{statsError}</p>}

            <div className="profile-stats__grid">
              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">📦</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("supplier.profile.stats.productsListed")}</h4>
                  <p className="stat-card__value">{businessStats.products}</p>
                </div>
              </div>

              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">🚜</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("supplier.profile.stats.equipmentListed")}</h4>
                  <p className="stat-card__value">{businessStats.equipment}</p>
                </div>
              </div>

              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">📊</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("supplier.profile.stats.totalSales")}</h4>
                  <p className="stat-card__value">{currencyFormatter.format(businessStats.totalSales)}</p>
                </div>
              </div>

              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">🧾</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("supplier.profile.stats.totalOrders")}</h4>
                  <p className="stat-card__value">{businessStats.totalOrders}</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section className="profile-v2-danger" variants={fadeUp}>
            <div>
              <h3>
                <span className="material-symbols-outlined">warning</span>
                Danger Zone
              </h3>
              <p>
                Deleting your account will permanently remove your supplier profile,
                inventory history, and order records. This action cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              className="btn btn--danger-outline"
              onClick={handleDeleteAccount}
              loading={deletingAccount}
            >
              {t("supplier.profile.deleteAccount")}
            </Button>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
}
