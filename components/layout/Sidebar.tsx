import Link from "next/link";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="2"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="2"
          y="11"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="48"
              height="48"
              rx="12"
              fill="url(#sidebar-logo-grad)"
            />
            <path
              d="M14 34V14h6l4 12 4-12h6v20h-5V21l-3.5 10h-3L19 21v13h-5z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="sidebar-logo-grad"
                x1="0"
                y1="0"
                x2="48"
                y2="48"
              >
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="sidebar-brand-text">SMK Portal</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="sidebar-nav-item active">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="sidebar-version">v0.1.0</p>
      </div>
    </aside>
  );
}
