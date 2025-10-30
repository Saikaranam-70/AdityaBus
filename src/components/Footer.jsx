import { FaLinkedin, FaInstagram, FaGithub, FaGlobe } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-700 text-white py-6 mt-auto shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
        {/* 👨‍💻 Developer Info */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-semibold">Aditya Bus Tracker</h2>
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} | Developed by{" "}
            <b>Sai Manikanta Karanam</b>
          </p>
        </div>

        {/* 🌐 Social Links */}
        <div className="flex space-x-5 text-2xl">
          <a
            href="https://www.linkedin.com/in/saikaranam70/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition-transform transform hover:scale-110"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.instagram.com/cl_me__sai_?igsh=MWhrdm90eDg3bzVzdQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-transform transform hover:scale-110"
          >
            <FaInstagram />
          </a>
          <a
            href="https://github.com/Saikaranam-70"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-transform transform hover:scale-110"
          >
            <FaGithub />
          </a>
          <a
            href="https://sai-karanam-portifolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-300 transition-transform transform hover:scale-110"
          >
            <FaGlobe />
          </a>
        </div>
      </div>
    </footer>
  );
}
