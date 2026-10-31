import React, { useEffect } from "react";
import clsx from "clsx";
import { KTIcon } from "../../../_metronic/helpers/components/KTIcon";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  footer,
  children,
  closeOnBackdrop = true,
  className = "",
  bodyClassName = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={clsx(
          "modal-dialog",
          size !== "md" && `modal-${size}`,
          className
        )}
      >
        {title && (
          <div className="modal-header">
            <h4 className="modal-title">{title}</h4>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-18" />
            </button>
          </div>
        )}
        <div className={clsx("modal-body", bodyClassName)}>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
