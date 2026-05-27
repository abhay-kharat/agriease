import { AnimatePresence, motion } from "framer-motion";

export default function GlobalLoadingScreen({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="global-loader__orb">
            <motion.span
              className="global-loader__ring"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
            />
            <img className="global-loader__logo" src="/logo.svg" alt="AgriEase" />
          </div>
          <p className="global-loader__label">Preparing your AgriEase workspace...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
