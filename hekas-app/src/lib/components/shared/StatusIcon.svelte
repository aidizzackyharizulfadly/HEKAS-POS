<!--
  StatusIcon (HEKAS POS — shared)
  Renders Lucide icon by string name. Replaces emoji icons across the app.

  Usage:
    <StatusIcon icon="check" class="size-4 text-green-600" />
    <StatusIcon icon="alert-triangle" size={16} />
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import {
		// Status
		Check,
		X,
		AlertTriangle,
		AlertCircle,
		AlertOctagon,
		Clock,
		Hourglass,
		Ban,
		Circle,
		CircleSlash,
		CheckCircle2,
		Repeat,
		// Files
		FileText,
		FileBarChart,
		FileSpreadsheet,
		Receipt,
		Printer,
		Save,
		Download,
		Upload,
		Pencil,
		Trash2,
		Eye,
		Inbox,
		Plus,
		Minus,
		Edit,
		MoreHorizontal,
		// Money
		Wallet,
		CreditCard,
		Coins,
		Banknote,
		Smartphone,
		QrCode,
		// Trends
		TrendingUp,
		TrendingDown,
		// UI
		Search,
		Filter,
		Settings,
		// People
		Users,
		User,
		UserPlus,
		UserCheck,
		Briefcase,
		// Notifications
		Bell,
		Lock,
		Key,
		// Logistics
		Truck,
		ShoppingCart,
		Package,
		PackageOpen,
		Package2,
		Boxes,
		// Awards
		Star,
		Award,
		Trophy,
		Medal,
		Crown,
		Heart,
		// Misc
		Flame,
		Lightbulb,
		MessageSquare,
		Bot,
		Cake,
		Home,
		Wrench,
		Mail,
		HelpCircle,
		Sun,
		Moon,
		Image as ImageIcon,
		Camera,
		Volume2,
		Palette,
		Calendar,
		Clock4,
		MapPin,
		Compass,
		// Extra (covers all audited usage)
		BarChart3,
		Cigarette,
		GlassWater,
		Snowflake,
		Sparkles,
		Wheat,
		Cookie,
		Frown,
		Pause,
		Globe,
		LayoutGrid,
		Gem,
		Zap,
		Umbrella,
		Database,
		Server,
		HardDrive,
		Tag,
		Tags,
		Box,
		ShoppingBag,
		TruckIcon as TruckAlt,
		CloudDownload,
		CloudUpload,
		Folder,
		FolderOpen
	} from '@lucide/svelte';

	// Map icon string → Lucide component
	const ICON_MAP: Record<string, Component> = {
		// Status
		check: Check,
		'check-circle': CheckCircle2,
		'check-circle-2': CheckCircle2,
		x: X,
		close: X,
		'alert-triangle': AlertTriangle,
		warning: AlertTriangle,
		'alert-circle': AlertCircle,
		error: AlertCircle,
		clock: Clock,
		wait: Clock,
		hourglass: Hourglass,
		ban: Ban,
		prohibited: Ban,
		circle: Circle,
		'slash-circle': CircleSlash,
		'circle-slash': CircleSlash,
		repeat: Repeat,
		refresh: Repeat,
		undo: Repeat,
		'rotate-ccw': Repeat,
		rotate: Repeat,

		// Files & documents
		'file-text': FileText,
		document: FileText,
		'file-spreadsheet': FileSpreadsheet,
		'file-bar-chart': FileBarChart,
		receipt: Receipt,
		printer: Printer,
		print: Printer,
		save: Save,
		download: Download,
		upload: Upload,
		edit: Edit,
		pencil: Pencil,
		trash: Trash2,
		delete: Trash2,
		eye: Eye,
		view: Eye,
		plus: Plus,
		add: Plus,
		minus: Minus,
		inbox: Inbox,
		archive: Inbox,
		more: MoreHorizontal,

		// Money
		wallet: Wallet,
		'credit-card': CreditCard,
		card: CreditCard,
		coins: Coins,
		banknote: Banknote,
		cash: Banknote,
		smartphone: Smartphone,
		phone: Smartphone,
		'qr-code': QrCode,
		money: Wallet,
		'glass-water': GlassWater,
		wheat: Wheat,
		cigarette: Cigarette,
		snowflake: Snowflake,
		sparkles: Sparkles,
		cookie: Cookie,
		'bar-chart-3': BarChart3,
		'chart-bar': BarChart3,
		'bar-chart': BarChart3,

		// Trends
		'trending-up': TrendingUp,
		'trending-down': TrendingDown,
		up: TrendingUp,
		down: TrendingDown,
		growth: TrendingUp,

		// UI
		search: Search,
		filter: Filter,
		settings: Settings,
		gear: Settings,

		// People
		users: Users,
		people: Users,
		user: User,
		person: User,
		'user-plus': UserPlus,
		'add-user': UserPlus,
		'user-check': UserCheck,
		briefcase: Briefcase,
		employee: Briefcase,

		// Notifications
		bell: Bell,
		notification: Bell,
		lock: Lock,
		key: Key,

		// Logistics
		truck: Truck,
		shipping: Truck,
		'shopping-cart': ShoppingCart,
		cart: ShoppingCart,
		package: Package,
		box: Box,
		'package-open': PackageOpen,
		'package-2': Package2,
		boxes: Boxes,
		'shopping-bag': ShoppingBag,
		tag: Tag,
		tags: Tags,

		// Awards
		star: Star,
		award: Award,
		trophy: Trophy,
		medal: Medal,
		crown: Crown,
		heart: Heart,

		// Misc
		flame: Flame,
		fire: Flame,
		lightbulb: Lightbulb,
		idea: Lightbulb,
		message: MessageSquare,
		chat: MessageSquare,
		bot: Bot,
		cake: Cake,
		birthday: Cake,
		home: Home,
		house: Home,
		wrench: Wrench,
		tool: Wrench,
		mail: Mail,
		email: Mail,
		help: HelpCircle,
		question: HelpCircle,
		'alert-octagon': AlertOctagon,
		critical: AlertOctagon,
		sun: Sun,
		'light-mode': Sun,
		moon: Moon,
		'dark-mode': Moon,
		image: ImageIcon,
		photo: ImageIcon,
		camera: Camera,
		volume: Volume2,
		sound: Volume2,
		palette: Palette,
		theme: Palette,
		calendar: Calendar,
		date: Calendar,
		clock4: Clock4,
		time: Clock4,
		'map-pin': MapPin,
		location: MapPin,
		compass: Compass,
		frown: Frown,
		pause: Pause,
		globe: Globe,
		'layout-grid': LayoutGrid,
		grid: LayoutGrid,
		gem: Gem,
		zap: Zap,
		umbrella: Umbrella,
		'umbrella-beach': Umbrella,
		database: Database,
		server: Server,
		'hard-drive': HardDrive,
		'cloud-download': CloudDownload,
		'cloud-upload': CloudUpload,
		folder: Folder,
		'folder-open': FolderOpen
	};

	type Props = {
		icon: string;
		size?: number;
		class?: string;
		color?: string;
		strokeWidth?: number;
	};

	let {
		icon,
		size = 16,
		class: className = '',
		color,
		strokeWidth
	}: Props = $props();

	const IconComponent = $derived(ICON_MAP[icon]);
</script>

{#if IconComponent}
	<svelte:component this={IconComponent} {size} class={className} {color} {strokeWidth} />
{:else}
	<!-- Fallback: render original emoji if no lucide match (for backward compat) -->
	<span aria-hidden="true" class={className}>{icon}</span>
{/if}