import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function LearnIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" /><path d="M8 16.5h10" /><path d="M9 8h5M9 11h3" /></IconBase>;
}

export function ProgressIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 20V10M12 20V4M19 20v-7" /></IconBase>;
}

export function TracksIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 4v12a4 4 0 0 0 4 4h8" /><path d="m14 16 4 4-4 4" transform="translate(0 -4)" /><circle cx="6" cy="4" r="2" /></IconBase>;
}

export function ProfileIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></IconBase>;
}

export function BookmarkIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" /></IconBase>;
}

export function FlameIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 22c4 0 7-3 7-7 0-3-1.5-5.5-4-8 .1 2-1 3.2-2 4-1-4-3-6-5-8 0 4-3 6-3 11 0 4.4 3 8 7 8Z" /><path d="M9.5 18c0-2 1.2-3.2 2.5-4.5.2 1.4 1.8 2.2 2 4a2.3 2.3 0 0 1-4.5.5Z" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6" /></IconBase>;
}

export function LockIcon(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></IconBase>;
}

export function CloudIcon(props: IconProps) {
  return <IconBase {...props}><path d="M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.7 11 4 4 0 0 1 17.5 19Z" /><path d="m9 14 3-3 3 3M12 11v6" /></IconBase>;
}

export function ArrowIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14m-5-5 5 5-5 5" /></IconBase>;
}

export function LightbulbIcon(props: IconProps) {
  return <IconBase {...props}><path d="M9 18h6M10 22h4" /><path d="M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5Z" /></IconBase>;
}
