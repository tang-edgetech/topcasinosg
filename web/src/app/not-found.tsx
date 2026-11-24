import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassName } from "@/lib/pages";

// Shown for any address the site doesn't have (and wherever a page calls
// notFound()), inside the normal header and footer from app/layout.tsx.
// Next.js answers these with a 404 status and a "noindex" robots tag.
// Class names / ids are for the site's CSS design layer.
export const metadata: Metadata = {
  title: "Page Not Found | Top Casino SG",
  description: "The page you are looking for does not exist or has moved.",
};

export default function NotFound() {
  return (
    <section id="not-found-page" className="not-found-page section--not-found flex flex-1 flex-col bg-white">
      <div className="section-container py-[5rem]">
        <div className="section-row">
          <div className="section-col flex flex-col items-center gap-4 text-center">
            <p className="not-found-page__code text-6xl font-bold text-[var(--color-primary-900)]">404</p>
            <h1 className="not-found-page__title text-2xl font-bold text-[var(--color-primary-900)]">Page Not Found</h1>
            <p className="not-found-page__text max-w-xl text-[var(--color-text-muted)]">
              Sorry, the page you are looking for doesn&apos;t exist or has moved.
            </p>
            <Link href="/" className={`not-found-page__button ${buttonClassName("primary")}`}>
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
