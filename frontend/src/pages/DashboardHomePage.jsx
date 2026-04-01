/**
 * DashboardHomePage — /home and /dashboard route
 *
 * Renders the global Navbar above the existing HomePage dashboard.
 * The existing HomePage component is untouched; this wrapper simply
 * adds the authenticated navigation bar and top-padding to compensate.
 */
import Navbar from "../components/Navbar";
import HomePage from "./HomePage";

export default function DashboardHomePage() {
  return (
    <>
      <Navbar />
      {/* pt-20 so content doesn't sit under the fixed navbar */}
      <div className="pt-20">
        <HomePage />
      </div>
    </>
  );
}
