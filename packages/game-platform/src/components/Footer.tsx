"use client";

import { Button } from "@gamehub/ui";
import { Gamepad2, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { mailto } from "../lib/env";
import { ModeToggle } from "./ModeToggle";

type FooterProps = {
  githubUrl?: string;
  linkedinUrl?: string;
  contactEmail?: string;
};

const footerSections = [
  {
    title: "Games",
    items: [
      { name: "All Games", href: "/games" },
      { name: "Featured", href: "/games?filter=featured" },
      { name: "New Releases", href: "/games?filter=new" },
      { name: "Popular", href: "/games?filter=popular" },
      { name: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
  {
    title: "Social",
    items: [],
  },
];

export function Footer({ githubUrl = "", linkedinUrl = "", contactEmail = "" }: FooterProps) {
  const [email, setEmail] = useState("");
  const [expanded, setExpanded] = useState(false);
  const socialLinks = [
    { name: "GitHub", href: githubUrl || "#", icon: Github },
    { name: "LinkedIn", href: linkedinUrl || "#", icon: Linkedin },
    { name: "Email", href: contactEmail ? mailto(contactEmail) : "#", icon: Mail },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-t backdrop-blur">
      <div className="container w-full max-w-[100vw] px-4 py-3 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="text-primary h-8 w-8" />
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
                Gamehub
              </span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              A collection of fun and engaging games for everyone.
            </p>
          </div>
          <div className="flex items-center justify-start gap-3 md:justify-end">
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              aria-expanded={expanded}
              aria-controls="footer-more"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Hide footer" : "More"}
            </Button>
          </div>
        </div>

        <div id="footer-more" hidden={!expanded} className="mt-4">
          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
            {footerSections.map((section) => {
              const items = section.title === "Social" ? socialLinks : section.items;

              return (
                <div key={section.title} className="space-y-4">
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <ul className="mt-2 space-y-2">
                    {items.map((item) => {
                      const isExternal = item.href.startsWith("http") || item.href.startsWith("mailto:");
                      return (
                        <li key={item.name}>
                          {isExternal ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                              {item.name}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Subscribe to our newsletter</h4>
              <p id="newsletter-help" className="text-muted-foreground text-sm">
                Get the latest updates and news.
              </p>
              <form onSubmit={handleSubmit} className="flex space-x-2" aria-describedby="newsletter-help">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-primary/60 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  suppressHydrationWarning
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 focus-visible:ring-primary/60 focus-visible:ring-2"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 md:mt-6 md:pt-4">
          <div className="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Gamehub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
