import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import SOSButton from "./components/SOSButton";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import SearchPage from "./pages/SearchPage";
import TrackingPage from "./pages/TrackingPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-secondary/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <SOSButton />
      <Toaster position="top-right" />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const trackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tracking",
  component: TrackingPage,
});
const reportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report",
  component: ReportPage,
});
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  trackingRoute,
  reportRoute,
  searchRoute,
  dashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
