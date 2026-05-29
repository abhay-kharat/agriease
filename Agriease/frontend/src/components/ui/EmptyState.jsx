import React from 'react';
import Button from './Button';
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {LucideIcon} props.icon - The Lucide icon to display
 * @param {string} props.title - The main empty state title
 * @param {string} props.description - Supporting text for the empty state
 * @param {string} [props.actionLabel] - Optional text for a CTA button
 * @param {Function} [props.onAction] - Optional callback for the CTA button
 */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-md border-2 border-dashed border-gray-100/80"
    >
      <div className="bg-surface-soft p-5 rounded-full mb-6 shadow-inner">
        {Icon && <Icon size={42} className="text-primary opacity-80" />}
      </div>
      <h3 className="text-2xl font-display font-bold text-text-main mb-3">
        {title}
      </h3>
      <p className="text-text-muted max-w-sm mb-8 font-body leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
