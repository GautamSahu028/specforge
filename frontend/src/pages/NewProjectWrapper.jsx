/**
 * NewProjectWrapper — /new and /new-project routes
 *
 * Renders the Navbar above the existing NewProjectPage without
 * modifying any of its business logic.
 */
import Navbar from "../components/Navbar";
import NewProjectPage from "./NewProjectPage";

export default function NewProjectWrapper() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <NewProjectPage />
      </div>
    </>
  );
}
