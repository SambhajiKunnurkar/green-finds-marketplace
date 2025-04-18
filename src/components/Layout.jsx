
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, onSearch }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onSearch={onSearch} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
