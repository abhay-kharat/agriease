import { useState } from "react";
import api from "../api/axios";
import AuthInput from "./AuthInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;
  if (typeof responseData === "string") return responseData;
  return responseData?.message || "Registration failed. Please try again.";
};

const registerRequest = async (payload) => {
  try {
    // Required endpoint from spec
    return await api.post("/api/auth/register", payload);
  } catch (error) {
    if (error?.response?.status === 404) {
      // Backward compatibility with existing backend mapping
      return api.post("/auth/register", payload);
    }
    throw error;
  }
};

export default function RegisterForm({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER",
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

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!form.role) {
      nextErrors.role = "Please choose a role.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await registerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
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

  return (
    <form className="agri-auth-form" onSubmit={handleSubmit} noValidate>
      <AuthInput
        id="register-name"
        name="name"
        label="Full Name"
        autoComplete="name"
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
        autoComplete="email"
        value={form.email}
        onChange={updateField}
        error={errors.email}
        required
      />

      <AuthInput
        id="register-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        value={form.password}
        onChange={updateField}
        error={errors.password}
        required
      />

      <div className={`agri-role-group ${errors.role ? "has-error" : ""}`}>
        <label
          htmlFor="register-role"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Select Role
        </label>
        <select
          id="register-role"
          name="role"
          value={form.role}
          onChange={updateField}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: "var(--radius-sm, 12px)",
            border: "1px solid var(--border)",
            background: "var(--input-bg, var(--bg-elevated))",
            color: "var(--ink)",
            fontSize: "15px",
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234d6657' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 16px center",
            backgroundSize: "14px",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--primary)";
            e.target.style.boxShadow = "0 0 0 3px rgba(46, 125, 50, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        >
          <option value="FARMER">🌾 Farmer</option>
          <option value="SUPPLIER">📦 Supplier</option>
          <option value="DELIVERY_AGENT">🚚 Delivery Agent</option>
        </select>
        {errors.role ? <p className="agri-field-error">{errors.role}</p> : null}
      </div>

      {status.text ? (
        <p className={`agri-message ${status.type === "success" ? "success" : "error"}`} role="alert">
          {status.text}
        </p>
      ) : null}

      <button type="submit" className="agri-submit-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="agri-spinner" aria-hidden="true" />
            Creating account...
          </>
        ) : (
          "Register"
        )}
      </button>

      <button type="button" className="agri-link-btn" onClick={onSwitchToLogin}>
        Already have an account? Login
      </button>
    </form>
  );
}
