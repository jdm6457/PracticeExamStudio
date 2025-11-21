import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

const defaultProps = {
  className: "w-5 h-5 inline-block",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24"
};

const Icon = ({ className, children, ...props }: IconProps) => (
  <svg 
    {...defaultProps} 
    {...props} 
    className={`${defaultProps.className} ${className || ''}`.trim()}
  >
    {children}
  </svg>
);

export const HomeIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="5 12 3 12 12 3 21 12 19 12" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></Icon>;
export const TestIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 6h8" /><path d="M6 6h1" /><path d="M10 12h8" /><path d="M6 12h1" /><path d="M10 18h8" /><path d="M6 18h1" /><path d="M17 4h1a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-1" /><path d="M3 4h1a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-1" /></Icon>;
export const HistoryIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8v4l3 3" /><path d="M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z" /></Icon>;
export const ImportExportIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 11v6" /><path d="M9.5 13.5l2.5 2.5l2.5 -2.5" /></Icon>;
export const PlusIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
export const EditIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" /><path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" /><line x1="16" y1="5" x2="19" y2="8" /></Icon>;
export const TrashIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="4" y1="7" x2="20" y2="7" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></Icon>;
export const CheckIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></Icon>;
export const XIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>;
export const ChevronLeftIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="15 6 9 12 15 18" /></Icon>;
export const ChevronRightIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 6 15 12 9 18" /></Icon>;
export const FlagIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><line x1="5" y1="5" x2="5" y2="21" /><line x1="19" y1="5" x2="19" y2="14" /><path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0" /><path d="M5 14a5 5 0 0 1 7 0a5 5 0 0 0 7 0" /></Icon>;
export const EyeIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="2" /><path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" /></Icon>;
export const UploadIcon = (props: IconProps) => <Icon {...props}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><polyline points="7 9 12 4 17 9" /><line x1="12" y1="4" x2="12" y2="16" /></Icon>;