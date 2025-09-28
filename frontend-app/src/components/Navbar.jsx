import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/track", label: "Track" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const linkBase =
    "px-1 pb-1 text-sm uppercase tracking-wide font-medium text-neutral-700 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black";
  const activeLink =
    "text-black border-b-2 border-black";

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            Civigil
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? activeLink : "border-b-2 border-transparent"}`
                }
                end
              >
                {label}
              </NavLink>
            ))}

            <NavLink
              to="/report"
              className="rounded-full bg-black text-white text-sm font-semibold px-4 py-2 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              Report
            </NavLink>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-200">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? activeLink : "border-b-2 border-transparent"}`
                }
                end
              >
                {label}
              </NavLink>
            ))}

            <NavLink
              to="/report"
              onClick={() => setIsOpen(false)}
              className="block text-center rounded-full bg-black text-white text-sm font-semibold px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              Report
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;