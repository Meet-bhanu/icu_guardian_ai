import { Heart } from "lucide-react";
import { Link } from "wouter";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "Home", href: "/#home" },
      { label: "Features", href: "/#about" },
      { label: "Why HealthHalo", href: "/#about" },
      { label: "Contact", href: "/#contact" },
      { label: "About", href: "/#about" },
    ],
  },
  {
    title: "Portals",
    links: [
      { label: "Login", href: "/login" },
      { label: "Patient Dashboard", href: "/patient/dashboard" },
      { label: "Staff Dashboard", href: "/dashboard" },
      { label: "Role Selection", href: "/role-selection" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Monitoring", href: "/#about" },
      { label: "Alerts", href: "/dashboard/alerts" },
      { label: "Patients", href: "/dashboard/patients" },
      { label: "Support", href: "mailto:support@healthhalo.com" },
    ],
  },
];

function FooterNavSection({ title, links }: FooterSection) {
  return (
    <div className="mb-6 md:mb-0">
      <h5 className="font-semibold text-foreground mb-3">{title}</h5>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.label} className="mb-2">
            {link.href.startsWith("/") ? (
              <Link
                href={link.href}
                className="p-0 text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="p-0 text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4">
      <footer
        id="contact"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 py-12 my-8 border-t border-border"
      >
        <div className="mb-3 sm:col-span-2 md:col-span-1">
          <Link
            href="/"
            className="flex items-center mb-3 text-foreground no-underline hover:opacity-90 transition-opacity"
            aria-label="HealthHalo home"
          >
            <div className="w-10 h-10 hh-gradient-bg rounded-lg flex items-center justify-center me-2 shadow-sm shadow-primary/25">
              <Heart className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg tracking-tight">HealthHalo</span>
          </Link>
          <p className="text-muted-foreground">&copy; {year}</p>
        </div>

        <div className="hidden md:block mb-3" aria-hidden="true" />

        {footerSections.map((section) => (
          <FooterNavSection key={section.title} {...section} />
        ))}
      </footer>
    </div>
  );
}
