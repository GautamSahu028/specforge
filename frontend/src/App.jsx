import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import NewProjectPage from "./pages/NewProjectPage";
import ProjectViewPage from "./pages/ProjectViewPage";

export default function App() {
  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1a26",
            color: "#f0f0f5",
            border: "1px solid #2e2e40",
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#0a0a0f" } },
          error: { iconTheme: { primary: "#fb7185", secondary: "#0a0a0f" } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<ProjectViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
