import { useState } from "react";
import api from "../api/axios";
import AuthInput from "./AuthInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string") return responseData;
  return responseData?.message || "Registration failed. Please try again.";
};

const registerRequest = async (payload) => {
  try {
    return await api.post("/api/auth/register", payload);
  } catch (error) {
    if (error?.response?.status === 404) {
      return api.post("/auth/register", payload);
    }
    throw error;
  }
};

const VEHICLE_OPTIONS = [
  { value: "BIKE", label: "Bike" },
  { value: "VAN", label: "Van" },
  { value: "TRUCK", label: "Truck" },
  { value: "TRACTOR", label: "Tractor" },
];

export default function RegisterForm({ onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "FARMER",
    vehicleTypes: [],
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (status.text) setStatus({ type: "", text: "" });
  };

  const toggleVehicle = (type) => {
    setForm((prev) => {
      const current = prev.vehicleTypes;
      if (current.includes(type)) {
        return { ...prev, vehicleTypes: current.filter((t) => t !== type) };
      }
      return { ...prev, vehicleTypes: [...current, type] };
    });
    setErrors((prev) => ({ ...prev, vehicleTypes: "" }));
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!form.name.trim()) nextErrors.name = "Name is required.";
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!EMAIL_REGEX.test(form.email.trim())) {
        nextErrors.email = "Please enter a valid email address.";
      }
      if (!form.username.trim()) nextErrors.username = "Username is required.";
      if (!form.password) {
        nextErrors.password = "Password is required.";
      } else if (form.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters.";
      }
    }

    if (currentStep === 2) {
      if (!form.role) nextErrors.role = "Please choose a role.";
      if (form.role === "DELIVERY_AGENT" && form.vehicleTypes.length === 0) {
        nextErrors.vehicleTypes = "Please select at least one vehicle type.";
      }
    }

    if (currentStep === 3) {
      if (!form.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      } else if (!PHONE_REGEX.test(form.phone.trim())) {
        nextErrors.phone = "Please enter a valid phone number.";
      }
      if (!form.address.trim()) nextErrors.address = "Address is required.";
      if (!form.city.trim()) nextErrors.city = "City is required.";
      if (!form.state.trim()) nextErrors.state = "State is required.";
      if (!form.pincode.trim()) nextErrors.pincode = "Pincode is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await registerRequest({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });

      setStatus({
        type: "success",
        text: "Registration successful. Please log in with your new account.",
      });

      setTimeout(() => {
        onSwitchToLogin();
      }, 700);
    } catch (error) {
      setStatus({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="agri-progress-bar" style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            background: i <= step ? "var(--primary)" : "var(--border)",
            transition: "background 0.3s ease",
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="agri-register-wizard">
      {renderStepIndicator()}
      <form className="agri-auth-form" onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Step 1: Account Details</h3>
            <AuthInput
              id="register-name"
              name="name"
              label="Full Name"
              value={form.name}
              onChange={updateField}
              error={errors.name}
              required
            />
            <AuthInput
              id="register-email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={updateField}
              error={errors.email}
              required
            />
            <AuthInput
              id="register-username"
              name="username"
              label="Username"
              value={form.username}
              onChange={updateField}
              error={errors.username}
              required
            />
            <AuthInput
              id="register-password"
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={updateField}
              error={errors.password}
              required
            />
            <button type="button" className="agri-submit-btn" onClick={nextStep}>
              Next: Role Selection
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Step 2: Role & Capacity</h3>
            <div className={`agri-role-group ${errors.role ? "has-error" : ""}`}>
              <p>I am a...</p>
              <div>
                {["FARMER", "SUPPLIER", "DELIVERY_AGENT"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={form.role === r ? "active" : ""}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, role: r }));
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }}
                  >
                    {r.replace("_", " ")}
                  </button>
                ))}
              </div>
              {errors.role && <p className="agri-field-error">{errors.role}</p>}
            </div>

            {form.role === "DELIVERY_AGENT" && (
              <div className={`agri-role-group ${errors.vehicleTypes ? "has-error" : ""}`} style={{ marginTop: "16px" }}>
                <p>Select Vehicle Type(s)</p>
                <div style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  {VEHICLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={form.vehicleTypes.includes(opt.value) ? "active" : ""}
                      onClick={() => toggleVehicle(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.vehicleTypes && <p className="agri-field-error">{errors.vehicleTypes}</p>}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="agri-back-btn" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
              <button type="button" className="agri-submit-btn" onClick={nextStep} style={{ flex: 2 }}>
                Next: Contact Details
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Step 3: Contact Details</h3>
            <AuthInput
              id="register-phone"
              name="phone"
              label="Phone Number"
              value={form.phone}
              onChange={updateField}
              error={errors.phone}
              required
            />
            <AuthInput
              id="register-address"
              name="address"
              label="Street Address"
              value={form.address}
              onChange={updateField}
              error={errors.address}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <AuthInput
                id="register-city"
                name="city"
                label="City"
                value={form.city}
                onChange={updateField}
                error={errors.city}
                required
              />
              <AuthInput
                id="register-state"
                name="state"
                label="State"
                value={form.state}
                onChange={updateField}
                error={errors.state}
                required
              />
            </div>
            <AuthInput
              id="register-pincode"
              name="pincode"
              label="Pincode"
              value={form.pincode}
              onChange={updateField}
              error={errors.pincode}
              required
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="agri-back-btn" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
              <button type="button" className="agri-submit-btn" onClick={nextStep} style={{ flex: 2 }}>
                Next: Profile Photo
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Step 4: Finalize Profile</h3>
            <div style={{ padding: "20px", border: "2px dashed var(--border)", borderRadius: "14px", textAlign: "center", marginBottom: "16px" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Profile Photo Upload (Optional)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm((prev) => ({ ...prev, profilePhoto: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ marginTop: "8px" }}
              />
            </div>
            
            {status.text && (
              <p className={`agri-message ${status.type === "success" ? "success" : "error"}`} role="alert">
                {status.text}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" className="agri-back-btn" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="agri-submit-btn" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Creating account..." : "Complete Registration"}
              </button>
            </div>
          </>
        )}

        <button type="button" className="agri-link-btn" onClick={onSwitchToLogin} style={{ marginTop: "12px" }}>
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}
