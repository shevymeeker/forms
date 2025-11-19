/**
 * Simple Router for Single Page Application
 * Handles navigation between different views
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.beforeNavigate = null;
  }

  /**
   * Register a route
   */
  register(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Navigate to a route
   */
  async navigate(path, params = {}) {
    // Call beforeNavigate hook if set
    if (this.beforeNavigate) {
      const canNavigate = await this.beforeNavigate(path, params);
      if (!canNavigate) return;
    }

    const handler = this.routes[path];

    if (handler) {
      this.currentView = path;

      // Log navigation for analytics
      if (window.DB) {
        await window.DB.logEvent('navigation', { from: this.currentView, to: path });
      }

      // Call the route handler with params
      await handler(params);

      // Update URL hash without triggering navigation
      window.location.hash = path;
    } else {
      console.error(`[Router] No route found for: ${path}`);
      this.navigate('/dashboard');
    }
  }

  /**
   * Set up hash change listener
   */
  init() {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/';
      this.navigate(path);
    });

    // Handle initial route
    const initialPath = window.location.hash.slice(1) || '/';
    this.navigate(initialPath);
  }

  /**
   * Set a hook to run before navigation
   */
  setBeforeNavigate(fn) {
    this.beforeNavigate = fn;
  }
}

// Create singleton instance
const router = new Router();

// Export for use in other modules
window.Router = router;
