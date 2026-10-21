import { designAssets } from "../config";
import type { AssetProps, AvatarProps } from "../../../component/type/home";


export function DesignImage({ id, className = "", alt = "" }: AssetProps) {
    const asset = designAssets[id];
    return <span className={`home-image ${className}`} data-design-asset={id}>
        <img src={asset.src} alt={alt} />
    </span>;
}

export function DesignIcon({ id, className = "" }: AssetProps) {
    // This SVG has a 32px root in a 15px Figma slot. Scale its canvas,
    // preserving the original SVG dimensions and aspect ratio.
    const smallCanvas = ["3352:977", "3352:987", "3352:997"].includes(id);
    return <span className={`home-icon ${smallCanvas ? "home-icon-canvas" : ""} ${className}`} aria-hidden="true" data-design-asset={id}>
        <img src={designAssets[id].src} alt="" />
    </span>;
}

export function Avatar({ id, size = 40, online = false, alt = "" }: AvatarProps) {
    return <span className={"home-avatar home-avatar-" + size}>
        <DesignImage id={id} alt={alt} />
        {online && <span className="home-online-dot" />}
    </span>;
}
