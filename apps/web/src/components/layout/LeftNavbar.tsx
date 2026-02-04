import { useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

// =============================================================================
// ICONS - Matching Figma design
// =============================================================================

function HomeIcon({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M2.5 7.5L10 1.25L17.5 7.5V16.25C17.5 16.5815 17.3683 16.8995 17.1339 17.1339C16.8995 17.3683 16.5815 17.5 16.25 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V7.5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M7.5 17.5V10H12.5V17.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function HistoryIcon({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M10 5V10L13.75 11.875"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M1.875 10C1.875 14.4875 5.5125 18.125 10 18.125C14.4875 18.125 18.125 14.4875 18.125 10C18.125 5.5125 14.4875 1.875 10 1.875C6.875 1.875 4.125 3.625 2.8125 6.25"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M1.875 2.5V6.25H5.625"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function DocsIcon({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M11.25 1.875H5C4.66848 1.875 4.35054 2.0067 4.11612 2.24112C3.8817 2.47554 3.75 2.79348 3.75 3.125V16.875C3.75 17.2065 3.8817 17.5245 4.11612 17.7589C4.35054 17.9933 4.66848 18.125 5 18.125H15C15.3315 18.125 15.6495 17.9933 15.8839 17.7589C16.1183 17.5245 16.25 17.2065 16.25 16.875V6.875L11.25 1.875Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.25 1.875V6.875H16.25"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.125 10.625H6.875"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.125 13.75H6.875"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.125 7.5H6.875"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function SettingsIcon({ className }: { className?: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.1667 12.5C16.0557 12.7513 16.0226 13.0302 16.0717 13.3005C16.1207 13.5708 16.2496 13.8203 16.4417 14.0167L16.4917 14.0667C16.6466 14.2214 16.7695 14.4053 16.8533 14.6076C16.9372 14.8099 16.9805 15.0267 16.9805 15.2458C16.9805 15.465 16.9372 15.6817 16.8533 15.884C16.7695 16.0863 16.6466 16.2703 16.4917 16.425C16.337 16.5799 16.153 16.7028 15.9507 16.7866C15.7484 16.8705 15.5317 16.9138 15.3125 16.9138C15.0933 16.9138 14.8766 16.8705 14.6743 16.7866C14.472 16.7028 14.288 16.5799 14.1333 16.425L14.0833 16.375C13.887 16.1829 13.6375 16.054 13.3672 16.005C13.0969 15.9559 12.818 15.989 12.5667 16.1C12.3203 16.2056 12.1124 16.3828 11.9692 16.6088C11.826 16.8348 11.7541 17.0993 11.7625 17.3667V17.5C11.7625 17.942 11.5869 18.366 11.2743 18.6785C10.9618 18.9911 10.5378 19.1667 10.0958 19.1667C9.65387 19.1667 9.22994 18.9911 8.91738 18.6785C8.60482 18.366 8.42917 17.942 8.42917 17.5V17.425C8.43168 17.1492 8.34903 16.8791 8.19205 16.6516C8.03506 16.4242 7.81139 16.2502 7.55 16.1533C7.29871 16.0423 7.01979 16.0093 6.74948 16.0583C6.47917 16.1074 6.22968 16.2363 6.03333 16.4283L5.98333 16.4783C5.82866 16.6332 5.64469 16.7561 5.44238 16.84C5.24008 16.9238 5.02334 16.9672 4.80417 16.9672C4.585 16.9672 4.36825 16.9238 4.16595 16.84C3.96365 16.7561 3.77968 16.6332 3.625 16.4783C3.47014 16.3237 3.34723 16.1397 3.26338 15.9374C3.17954 15.7351 3.13616 15.5183 3.13616 15.2992C3.13616 15.08 3.17954 14.8633 3.26338 14.661C3.34723 14.4587 3.47014 14.2747 3.625 14.12L3.675 14.07C3.86706 13.8736 3.99599 13.6241 4.04504 13.3538C4.09409 13.0835 4.06098 12.8046 3.95 12.5533C3.84437 12.307 3.66716 12.099 3.44117 11.9558C3.21518 11.8127 2.9507 11.7407 2.68333 11.7492H2.5C2.05797 11.7492 1.63405 11.5735 1.32149 11.261C1.00893 10.9484 0.833332 10.5245 0.833332 10.0825C0.833332 9.64045 1.00893 9.21653 1.32149 8.90397C1.63405 8.59141 2.05797 8.41581 2.5 8.41581H2.575C2.85084 8.41832 3.12093 8.33566 3.3484 8.17868C3.57587 8.0217 3.74987 7.79803 3.84667 7.53664C3.95765 7.28535 3.99076 7.00643 3.94171 6.73612C3.89266 6.46581 3.76373 6.21632 3.57167 6.01997L3.52167 5.96997C3.36681 5.8153 3.24389 5.63133 3.16005 5.42902C3.07621 5.22672 3.03282 5.00998 3.03282 4.79081C3.03282 4.57164 3.07621 4.35489 3.16005 4.15259C3.24389 3.95029 3.36681 3.76632 3.52167 3.61164C3.67634 3.45678 3.86031 3.33387 4.06261 3.25002C4.26492 3.16618 4.48166 3.1228 4.70083 3.1228C4.92 3.1228 5.13675 3.16618 5.33905 3.25002C5.54136 3.33387 5.72532 3.45678 5.88 3.61164L5.93 3.66164C6.12635 3.8537 6.37584 3.98263 6.64615 4.03168C6.91646 4.08073 7.19538 4.04762 7.44667 3.93664H7.5C7.74636 3.831 7.95421 3.65379 8.09741 3.42781C8.24061 3.20182 8.31252 2.93734 8.30417 2.66997V2.49997C8.30417 2.05794 8.47976 1.63402 8.79232 1.32146C9.10488 1.0089 9.52881 0.833302 9.97083 0.833302C10.4129 0.833302 10.8368 1.0089 11.1493 1.32146C11.4619 1.63402 11.6375 2.05794 11.6375 2.49997V2.57497C11.6291 2.84234 11.7011 3.10682 11.8443 3.33281C11.9875 3.55879 12.1953 3.736 12.4417 3.84164C12.6929 3.95262 12.9719 3.98573 13.2422 3.93668C13.5125 3.88763 13.762 3.7587 13.9583 3.56664L14.0083 3.51664C14.163 3.36178 14.347 3.23887 14.5493 3.15502C14.7516 3.07118 14.9683 3.0278 15.1875 3.0278C15.4067 3.0278 15.6234 3.07118 15.8257 3.15502C16.028 3.23887 16.212 3.36178 16.3667 3.51664C16.5215 3.67132 16.6444 3.85529 16.7283 4.05759C16.8121 4.25989 16.8555 4.47664 16.8555 4.69581C16.8555 4.91498 16.8121 5.13172 16.7283 5.33402C16.6444 5.53633 16.5215 5.7203 16.3667 5.87497L16.3167 5.92497C16.1246 6.12132 15.9957 6.37081 15.9466 6.64112C15.8976 6.91143 15.9307 7.19035 16.0417 7.44164V7.49997C16.1473 7.74633 16.3245 7.95418 16.5505 8.09738C16.7765 8.24058 17.041 8.31249 17.3083 8.30414H17.5C17.942 8.30414 18.366 8.47974 18.6785 8.7923C18.9911 9.10486 19.1667 9.52878 19.1667 9.97081C19.1667 10.4128 18.9911 10.8368 18.6785 11.1493C18.366 11.4619 17.942 11.6375 17.5 11.6375H17.425C17.1576 11.6458 16.8932 11.7178 16.6672 11.861C16.4412 12.0042 16.264 12.212 16.1583 12.4583L16.1667 12.5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

// =============================================================================
// TYPES & DATA
// =============================================================================

type NavItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	path: string;
};

const mainNavItems: NavItem[] = [
	{ id: "home", label: "Review Intents", icon: HomeIcon, path: "/" },
	{ id: "history", label: "Transaction History", icon: HistoryIcon, path: "/history" },
];

const bottomNavItems: NavItem[] = [
	{ id: "api-docs", label: "API Docs", icon: DocsIcon, path: "/docs" },
	{ id: "settings", label: "Settings", icon: SettingsIcon, path: "/settings" },
];

// =============================================================================
// NAV BUTTON COMPONENT
// =============================================================================

interface NavButtonProps {
	item: NavItem;
	isActive: boolean;
	onClick: () => void;
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				// Base styles - size-36 = 36px button, rounded-full for circle
				"flex items-center justify-center size-36 rounded-full transition-all duration-200",
				// Active state: bg-base-transparent, text-base
				// Inactive state: transparent bg, text-muted, hover effects
				isActive
					? "bg-base-transparent text-base"
					: "bg-transparent text-muted hover:bg-muted-transparent hover:text-base",
			)}
			title={item.label}
			aria-label={item.label}
			aria-current={isActive ? "page" : undefined}
		>
			<Icon className="size-20" />
		</button>
	);
}

/** Get the nav item ID from the current pathname */
function getActiveItemFromPath(pathname: string): string {
	if (pathname === "/") return "home";
	if (pathname.startsWith("/history")) return "history";
	if (pathname.startsWith("/docs")) return "api-docs";
	if (pathname.startsWith("/settings")) return "settings";
	return "home";
}

// =============================================================================
// LEFT NAVBAR COMPONENT
// =============================================================================

export interface LeftNavbarProps {
	/** Additional CSS classes */
	className?: string;
}

/**
 * LeftNavbar - Vertical navigation sidebar matching Figma design
 *
 * Layout (from Figma):
 * - display: inline-flex
 * - height: 616px
 * - padding: 24px 16px
 * - align-items: center
 * - gap: 10px
 *
 * Style (from Figma):
 * - border-radius: 999px (rounded-full)
 * - background: var(--background-muted-transparent)
 */
export function LeftNavbar({ className }: LeftNavbarProps = {}) {
	const location = useLocation();
	const navigate = useNavigate();

	const activeItem = getActiveItemFromPath(location.pathname);

	const handleNavigate = (item: NavItem) => {
		navigate({ to: item.path });
	};

	return (
		<nav
			className={cn(
				// Layout from Figma
				"inline-flex flex-col items-center justify-between",
				"h-[616px] px-16 py-24 gap-10",
				// Style from Figma
				"rounded-full",
				"bg-muted-transparent",
				className,
			)}
			aria-label="Main navigation"
		>
			{/* Top navigation items */}
			<div className="flex flex-col items-center gap-16">
				{mainNavItems.map((item) => (
					<NavButton
						key={item.id}
						item={item}
						isActive={activeItem === item.id}
						onClick={() => handleNavigate(item)}
					/>
				))}
			</div>

			{/* Bottom navigation items */}
			<div className="flex flex-col items-center gap-16">
				{bottomNavItems.map((item) => (
					<NavButton
						key={item.id}
						item={item}
						isActive={activeItem === item.id}
						onClick={() => handleNavigate(item)}
					/>
				))}
			</div>
		</nav>
	);
}
