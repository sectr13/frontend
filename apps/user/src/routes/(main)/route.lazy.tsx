import {
  createLazyFileRoute,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import Footer from "@/layout/footer";
import Header from "@/layout/header";

export const Route = createLazyFileRoute("/(main)")({
  component: MainLayout,
});

function MainLayout() {
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <div
      className={
        isHomepage
          ? "min-h-screen bg-[#F8FAFC] text-slate-950 dark:bg-slate-950 dark:text-slate-50"
          : undefined
      }
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
