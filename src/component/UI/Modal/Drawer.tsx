import React, { useEffect } from "react";
import clsx from "clsx";
import { KTIcon } from "../../../_metronic/helpers/components/KTIcon";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  placement?: "start" | "end";
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  placement = "end",
  footer,
  children,
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
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div
        className={clsx(
          "drawer",
          `drawer-${placement}`,
          isOpen && "drawer-on",
          className
        )}
      >
        {title && (
          <div className="drawer-header">
            <h4 className="drawer-title">{title}</h4>
            <button
              type="button"
              className="btn btn-sm btn-icon btn-light"
              aria-label="Close"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-16" />
            </button>
          </div>
        )}
        <div className={clsx("drawer-body", bodyClassName)}>{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </>
  );
};

export default Drawer;
