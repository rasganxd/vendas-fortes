
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  submenu?: NavItem[];
  expanded?: boolean;
  group?: string;
  name?: string; // For compatibility
}
