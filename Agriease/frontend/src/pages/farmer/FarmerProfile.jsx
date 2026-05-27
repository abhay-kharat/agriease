import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import BackButton from "../../components/BackButton";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import {
  getStoredMeasurementUnit,
  getStoredThemePreference,
  setStoredMeasurementUnit,
  setStoredThemePreference,
} from "../../utils/userPreferences";

export default function FarmerProfile() {
  const profileSections = ["personal", "security", "credentials", "preferences", "notifications"];
  const { user, updateUser, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    farmSize: "",
    cropTypes: "",
    profilePhoto: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    equipmentBookings: 0,
    activeBookings: 0,
    diseaseScans: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [themePreference, setThemePreference] = useState(() => getStoredThemePreference());
  const [measurementUnit, setMeasurementUnit] = useState(() => getStoredMeasurementUnit());
  const [mapView, setMapView] = useState("Satellite Imagery");

  useEffect(() => {
    setThemePreference(theme);
  }, [theme]);

  const handleThemePreferenceChange = (nextTheme) => {
    setThemePreference(nextTheme);
    setTheme(nextTheme);
    setStoredThemePreference(nextTheme);
  };

  const handleMeasurementUnitChange = (nextUnit) => {
    setMeasurementUnit(nextUnit);
    setStoredMeasurementUnit(nextUnit);
  };

  const loadProfile = useCallback(async () => {
    try {
      console.log("Loading farmer profile from backend...");
      const response = await api.get("/farmer/profile");
      if (response.data) {
        const userData = response.data;
        console.log("Farmer profile loaded:", userData);
        updateUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          farmSize: userData.farmSize || "",
          cropTypes: userData.cropTypes || "",
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
  }, [loadProfile]);

  const loadAccountStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError("");
      const [ordersRes, bookingsRes, diseaseRes] = await Promise.all([
        api.get("/farmer/orders"),
        api.get("/farmer/bookings"),
        api.get("/farmer/disease/reports"),
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const diseaseReports = Array.isArray(diseaseRes.data) ? diseaseRes.data : [];

      const activeBookings = bookings.filter((booking) => {
        const status = (booking.status || "").toUpperCase();
        return status !== "COMPLETED" && status !== "CANCELLED";
      }).length;

      setAccountStats({
        totalOrders: orders.length,
        equipmentBookings: bookings.length,
        activeBookings,
        diseaseScans: diseaseReports.length,
      });
    } catch (error) {
      console.error("Failed to load account stats", error);
      setStatsError(t("farmer.profile.statsError"));
    } finally {
      setStatsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAccountStats();
  }, [loadAccountStats]);

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
        farmSize: user.farmSize || "",
        cropTypes: user.cropTypes || "",
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
    
    console.log("Farmer form submitted, saving profile...");
    console.log("Form data being sent:", { ...formData, profilePhoto: formData.profilePhoto ? 'base64 image...' : 'none' });
    
    try {
      const response = await api.put("/farmer/profile", formData);
      
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
      loadAccountStats();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || t("messages.profileUpdateError"));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t("farmer.profile.deleteConfirm")
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
        <h1>Account Settings</h1>
        <p>Manage your agricultural credentials, profile information, and platform security.</p>
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
                <p>Update your photo and personal details.</p>
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
                        farmSize: user?.farmSize || "",
                        cropTypes: user?.cropTypes || "",
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
                    <span>{user?.name?.charAt(0).toUpperCase() || "F"}</span>
                  )}
                </div>

                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="farmer-photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="farmer-photo-upload" className="profile-v2-photo-btn">
                      {uploadingPhoto ? t("messages.uploadingImage") : t("farmer.profile.changePhoto")}
                    </label>
                    {photoPreview && (
                      <button type="button" className="profile-v2-photo-btn danger" onClick={removePhoto}>
                        {t("farmer.profile.removePhoto")}
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
                  <label>{t("farmer.profile.form.farmSizeLabel")}</label>
                  <input
                    type="text"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
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
                  <label>{t("farmer.profile.form.cropTypesLabel")}</label>
                  <input
                    type="text"
                    name="cropTypes"
                    value={formData.cropTypes}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input input--enhanced"
                  />
                </div>
              </div>
            </form>
          </motion.section>

          <motion.section id="credentials" className="profile-v2-credentials" variants={fadeUp}>
            <article className="profile-v2-credential-card green">
              <div className="profile-v2-credential-head">
                <span className="material-symbols-outlined">agriculture</span>
                <small>Active License</small>
              </div>
              <h3>Farmer ID: #AG-99210</h3>
              <p>Certified Organic Producer • Tier 1</p>
              <div className="profile-v2-meta-row">
                <span>Issue Date</span>
                <strong>Mar 12, 2023</strong>
              </div>
              <div className="profile-v2-meta-row">
                <span>Expiry Date</span>
                <strong>Mar 12, 2025</strong>
              </div>
            </article>

            <article className="profile-v2-credential-card blue">
              <div className="profile-v2-credential-head">
                <span className="material-symbols-outlined">verified_user</span>
                <small>Premium Vendor</small>
              </div>
              <h3>Verified Supplier</h3>
              <p>Seeds, Fertilizers and Equipment</p>
              <div className="profile-v2-meta-row">
                <span>Trust Score</span>
                <strong>98/100</strong>
              </div>
              <div className="profile-v2-meta-row">
                <span>Verification Level</span>
                <strong>Gold Standard</strong>
              </div>
            </article>
          </motion.section>

          <motion.section id="security" className="profile-v2-panel" variants={fadeUp}>
            <div className="profile-v2-panel-head">
              <div>
                <h2>Security and Privacy</h2>
                <p>Manage your password and account authentication.</p>
              </div>
            </div>

            <div className="profile-v2-list-row">
              <div>
                <h4>Password Management</h4>
                <p>Last updated 4 months ago</p>
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
                <p>Add an extra layer of security</p>
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
                <p>Customize how AgriEase works for you.</p>
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
                <label>Default Map View</label>
                <select value={mapView} onChange={(event) => setMapView(event.target.value)}>
                  <option>Satellite Imagery</option>
                  <option>Topographic</option>
                  <option>Yield Map Overlay</option>
                  <option>Moisture Analysis</option>
                </select>
              </div>

              <div>
                <label>Measurement Units</label>
                <div className="profile-v2-toggle-group">
                  <button
                    type="button"
                    className={measurementUnit === "metric" ? "is-active" : ""}
                    onClick={() => handleMeasurementUnitChange("metric")}
                  >
                    Metric (ha)
                  </button>
                  <button
                    type="button"
                    className={measurementUnit === "imperial" ? "is-active" : ""}
                    onClick={() => handleMeasurementUnitChange("imperial")}
                  >
                    Imperial (ac)
                  </button>
                </div>
              </div>

              <div id="notifications">
                <label>Notifications</label>
                <div className="profile-v2-list-row compact">
                  <div>
                    <h4>Order and booking updates</h4>
                    <p>Receive alerts for order and equipment status changes</p>
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
              <h3 className="profile-stats__title">{t("farmer.profile.accountStatsTitle")}</h3>
              <motion.button
                type="button"
                className="btn btn--icon"
                onClick={loadAccountStats}
                disabled={statsLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄
              </motion.button>
            </div>
            {statsError && <p className="profile-stats__error">{statsError}</p>}
            <div className="profile-stats__grid">
              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">🛒</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("farmer.profile.stats.totalOrders")}</h4>
                  <p className="stat-card__value">{statsLoading ? "--" : accountStats.totalOrders}</p>
                </div>
              </div>
              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">🚜</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("farmer.profile.stats.equipmentBookings")}</h4>
                  <p className="stat-card__value">{statsLoading ? "--" : accountStats.equipmentBookings}</p>
                  <p className="stat-card__helper">
                    {t("farmer.profile.stats.activeNow")}: {statsLoading ? "--" : accountStats.activeBookings}
                  </p>
                </div>
              </div>
              <div className="stat-card stat-card--premium">
                <div className="stat-card__icon">🌱</div>
                <div className="stat-card__content">
                  <h4 className="stat-card__title">{t("farmer.profile.stats.diseaseScans")}</h4>
                  <p className="stat-card__value">{statsLoading ? "--" : accountStats.diseaseScans}</p>
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
                Deleting your account will permanently remove all agricultural data, historical
                reports, and inventory logs. This action cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              className="btn btn--danger-outline"
              onClick={handleDeleteAccount}
              loading={deletingAccount}
            >
              Deactivate Account
            </Button>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
}
