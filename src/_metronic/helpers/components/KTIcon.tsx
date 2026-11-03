import React from "react";
import icons from "../icons-config/icons";

export type IconType = "duotone" | "solid" | "outline";

export interface KTIconProps {
  iconName: string;
  className?: string;
  iconType?: IconType;
}

export const KTIcon: React.FC<KTIconProps> = ({
  iconName,
  className = "",
  iconType = "outline",
}) => {
  const pathCount = iconType === "duotone" ? icons[iconName] || 0 : 0;

  return (
    <i className={`ki-${iconType} ki-${iconName}${className ? ` ${className}` : ""}`}>
      {iconType === "duotone" &&
        Array.from({ length: pathCount }, (_, i) => (
          <span key={`${iconName}-path-${i + 1}`} className={`path${i + 1}`} />
        ))}
    </i>
  );
};

export default KTIcon;