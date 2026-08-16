"use client";

import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  compact?: boolean;
};

const SWITCH_WIDTH = 35.86;
const SWITCH_HEIGHT = 18.02;

function SwitchBase() {
  return (
    <>
      <rect
        fill="#f1f1f2"
        height="17.22"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="0.8"
        width="35.06"
        x="0.4"
        y="0.4"
      />
      <path
        d="m4.91,13.46c-.33,0-.64-.06-.91-.17-.27-.11-.51-.26-.7-.46-.19-.19-.34-.43-.45-.7-.1-.27-.16-.57-.16-.89,0-.33.04-.63.14-.9.1-.27.25-.51.44-.7.19-.2.42-.35.7-.46.27-.11.57-.17.91-.17s.62.06.89.17c.27.11.5.26.69.46.19.2.34.43.45.7.11.27.16.57.17.9,0,.32-.05.62-.16.89-.1.27-.25.5-.44.7-.19.19-.42.35-.69.46-.27.11-.56.17-.89.17Zm-.05-.78c.22,0,.43-.03.62-.1.19-.07.35-.17.49-.29.14-.13.25-.28.32-.45.08-.17.12-.37.12-.59s-.04-.41-.12-.59c-.08-.18-.19-.33-.32-.45-.14-.13-.3-.22-.49-.29s-.4-.1-.62-.1c-.21,0-.4.03-.58.1-.18.07-.34.17-.47.29-.14.13-.24.28-.32.45s-.12.37-.12.59.04.41.12.59c.08.18.18.33.32.45.14.13.29.22.47.29.18.07.38.1.58.1Z"
        fill="currentColor"
      />
      <path d="m2.8,8.32v-.99l3.1-2.02h0s-3.1-.01-3.1-.01v-.74h4.18v.94l-3.2,2.07h0s3.2.01,3.2.01v.74H2.8Z" fill="currentColor" />
      <path
        d="m30.99,14.62c-.33,0-.64-.06-.91-.17-.27-.11-.51-.26-.7-.46-.19-.19-.34-.43-.45-.7-.1-.27-.16-.57-.16-.89,0-.33.04-.63.14-.9.1-.27.25-.51.44-.7.19-.2.42-.35.7-.46.27-.11.57-.17.91-.17s.62.06.89.17c.27.11.5.26.69.46.19.2.34.43.45.7.11.27.16.57.17.9,0,.32-.05.62-.16.89-.1.27-.25.5-.44.7-.19.19-.42.35-.69.46-.27.11-.56.17-.89.17Zm-.05-.78c.22,0,.43-.03.62-.1.19-.07.35-.17.49-.29.14-.13.25-.28.32-.45.08-.17.12-.37.12-.59s-.04-.41-.12-.59c-.08-.18-.19-.33-.32-.45-.14-.13-.3-.22-.49-.29s-.4-.1-.62-.1c-.21,0-.4.03-.58.1-.18.07-.34.17-.47.29-.14.13-.24.28-.32.45-.08.17-.12.37-.12.59s.04.41.12.59c.08.18.18.33.32.45.14.13.29.22.47.29.18.07.38.1.58.1Z"
        fill="currentColor"
      />
      <path d="m28.88,9.48v-2.7h.67v1.95h1.1v-1.84h.67v1.84h1.73v.74h-4.18Z" fill="currentColor" />
      <path d="m28.88,6.1v-2.7h.67v1.95h1.1v-1.84h.67v1.84h1.73v.74h-4.18Z" fill="currentColor" />
    </>
  );
}

function CenterSwitch({ mirrored }: { mirrored: boolean }) {
  return (
    <g
      data-pyramid-side={mirrored ? "off" : "on"}
      transform={mirrored ? `translate(${SWITCH_WIDTH} 0) scale(-1 1)` : undefined}
    >
      <rect
        fill="#fff"
        height="6.33"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.69"
        width="14.25"
        x="10.8"
        y="6"
      />
      <polyline
        fill="#fff"
        points="10.8 12.33 10.8 6 14.28 3.77 14.28 10.1 10.8 12.33"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.69"
      />
      <polyline
        fill="#fff"
        points="17.77 12.33 17.77 6 14.28 3.77 14.28 10.1 17.77 12.33"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.69"
      />
      <polygon fill="currentColor" points="11.17 12.09 14.28 10.23 17.5 12.33 11.17 12.09" />
    </g>
  );
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <IconButton
      aria-pressed={isLightMode}
      data-state={isLightMode ? "on" : "off"}
      data-theme-toggle="true"
      label={isLightMode ? "ON: light mode. Switch to dark theme" : "OFF: dark mode. Switch to light theme"}
      className={cn("group active:scale-[0.98]", compact ? "h-6 w-12 sm:h-7 sm:w-14" : "h-7 w-14")}
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      <svg
        aria-hidden="true"
        className="h-full w-full overflow-visible"
        fill="none"
        viewBox={`0 0 ${SWITCH_WIDTH} ${SWITCH_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <SwitchBase />
        <CenterSwitch mirrored={isLightMode} />
      </svg>
    </IconButton>
  );
}
