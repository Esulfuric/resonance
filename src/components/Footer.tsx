
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Resonance</h2>
            <p className="text-sm text-muted-foreground mt-1">Connect through music.</p>
          </div>
          <div className="mt-6 md:mt-0">
            <div className="flex flex-wrap gap-8">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:info@resonance.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Resonance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
