/**
 * Icon registry — maps lucide icon name (string) to component.
 *
 * Decouples auth/roles.ts (string-based) from the icon library
 * so we can swap icon sets without touching menu definitions.
 *
 * Untuk tambah icon baru: import dari @lucide/svelte lalu masukin ke map.
 */
import {
	Home,
	ShoppingCart,
	Receipt,
	Package,
	PackageOpen,
	Users,
	Clock,
	BarChart3,
	Settings,
	Truck,
	FileText,
	TrendingUp,
	Wallet,
	Sparkles,
	LogOut,
	Search,
	Bell,
	ChevronDown,
	CircleUserRound,
	LayoutGrid,
	GlassWater,
	Cookie,
	Wheat,
	ShoppingBasket,
	Snowflake,
	Cigarette,
	Plus,
	type Icon as IconType
} from '@lucide/svelte';

type IconComponent = typeof IconType;

export const iconMap: Record<string, IconComponent> = {
	Home,
	ShoppingCart,
	Receipt,
	Package,
	PackageOpen,
	Users,
	Clock,
	BarChart3,
	Settings,
	Truck,
	FileText,
	TrendingUp,
	Wallet,
	Sparkles,
	LogOut,
	Search,
	Bell,
	ChevronDown,
	CircleUserRound,
	LayoutGrid,
	GlassWater,
	Cookie,
	Wheat,
	ShoppingBasket,
	Snowflake,
	Cigarette,
	Plus
};

export function getIcon(name: string): IconComponent | null {
	return iconMap[name] ?? null;
}
