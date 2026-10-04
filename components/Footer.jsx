import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background mt-auto py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-foreground font-medium">
          <div className="flex items-center gap-2 uppercase">
            &copy; {new Date().getFullYear()} WIGZ
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">
              Terms of Service
            </Link>
            <Link href="/shipping" className="hover:opacity-70 transition-opacity">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
