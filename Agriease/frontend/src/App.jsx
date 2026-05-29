import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ToastContainer } from "react-toastify";
import { NotificationProvider } from "./context/NotificationContext";
import GlobalInterceptor from './components/GlobalInterceptor';
import GlobalLoadingScreen from "./components/GlobalLoadingScreen";
import GlobalPageEffects from "./components/GlobalPageEffects";

import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import Login from "./pages/Login";
import Register from "./pages/Register";


import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import DeliveryAgentDashboard from "./pages/agent/DeliveryAgentDashboard";
import OrderTracking from "./pages/farmer/OrderTracking";

function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const redirectPath =
      user.role === "SUPPLIER"
        ? "/supplier"
        : user.role === "DELIVERY_AGENT"
          ? "/agent-dashboard"
          : "/farmer";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function AppFooter() {
  const { t } = useLanguage();
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/farmer") ||
    location.pathname.startsWith("/supplier") ||
    location.pathname.startsWith("/agent-dashboard");
  const isLandingRoute = location.pathname === "/";

  if (isDashboardRoute || isLandingRoute) return null;

  return (
    <footer className="app-footer">
      <div className="app-footer__left">{t("appFooter.copyright")}</div>
      <div className="app-footer__right">
        <a href="#" className="app-footer__link">{t("appFooter.privacy")}</a>
        <a href="#" className="app-footer__link">{t("appFooter.terms")}</a>
        <a href="#" className="app-footer__link">{t("appFooter.support")}</a>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    setRouteLoading(true);
    const timer = window.setTimeout(() => {
      setRouteLoading(false);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <GlobalInterceptor />
            <div className="app-root app-container">
              <GlobalLoadingScreen visible={routeLoading} />
              <GlobalPageEffects />
              <main className="app-main">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="route-transition-wrap"
                  >
                    <Routes location={location}>
                      <Route path="/" element={<Landing />} />
                      <Route path="/auth" element={<AuthPage initialMode="login" />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      

                      <Route
                        path="/farmer/*"
                        element={
                          <Protected role="FARMER">
                            <FarmerDashboard />
                          </Protected>
                        }
                      />

                      <Route
                        path="/supplier/*"
                        element={
                          <Protected role="SUPPLIER">
                            <SupplierDashboard />
                          </Protected>
                        }
                      />

                      <Route
                        path="/agent-dashboard"
                        element={
                          <Protected role="DELIVERY_AGENT">
                            <DeliveryAgentDashboard />
                          </Protected>
                        }
                      />

                      <Route
                        path="/orders/:orderId"
                        element={
                          <Protected role="FARMER">
                            <OrderTracking />
                          </Protected>
                        }
                      />
                    </Routes>
                  </motion.div>
                </AnimatePresence>
              </main>
              <AppFooter />
              <ToastContainer
                position="top-right"
                className="toast-container"
              />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
