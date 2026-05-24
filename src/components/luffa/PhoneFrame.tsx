import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  label?: string;
  rtl?: boolean;
  /** Fixed footer inside the frame (e.g. bottom nav). Main content scrolls above it. */
  footer?: ReactNode;
}

const PhoneFrame = ({ children, label, rtl = false, footer }: PhoneFrameProps) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className="phone-frame bg-background relative"
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* Status bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-xs font-medium text-foreground/80">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2.5 rounded-sm border border-foreground/60 relative">
            <div className="absolute inset-0.5 bg-foreground/60 rounded-[1px]" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-foreground rounded-b-2xl z-50" />
      {footer ? (
        <div className="h-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
          <div className="flex-shrink-0">{footer}</div>
        </div>
      ) : (
        <div className="h-full overflow-auto">{children}</div>
      )}
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-foreground/20" />
    </div>
    {label && (
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    )}
  </div>
);

export default PhoneFrame;
