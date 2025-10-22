import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
// --- FIX: Use relative path ---
import { useAuth } from "../context/AuthContext"; // Assuming context is one level up
import toast from "react-hot-toast";

// Assuming you have a logo file at this path - REMOVED for now
// import logo from "@/assets/logo.svg";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // Get auth state AND setToken from context
     // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
    const { user, setUser, isLoading, setToken } = useAuth(); // <-- ADD setToken

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Only track sections on home page
            if (location.pathname !== "/") {
                 setActiveSection(""); // Clear section if not on home page
                 return;
            }


            // Detect active section
            const sections = ["features", "how-it-works", "about"];
            // Adjust offset if navbar height changes when scrolled
            const scrollOffset = isScrolled ? 80 : 100;
            const scrollPosition = window.scrollY + scrollOffset;

            let currentSection = "";
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        currentSection = section;
                        break;
                    }
                }
            }
             // Handle case where scrolled past last section or very near top
             if (window.scrollY + window.innerHeight >= document.body.offsetHeight - 50) {
                 // If near bottom, keep last section active or clear based on preference
                 // currentSection = sections[sections.length - 1];
             } else if (window.scrollY < 150 && currentSection === "") {
                 // Keep empty if near top and no section detected yet
             }

             setActiveSection(currentSection);

        };

        handleScroll(); // Initial check
        window.addEventListener("scroll", handleScroll, { passive: true }); // Use passive listener
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname, isScrolled]); // Add isScrolled dependency if offset changes

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "About", href: "#about" },
    ];

    const scrollToSection = (href: string) => {
        if (location.pathname !== "/") {
            navigate("/");
            // Wait for navigation and potential re-render
            setTimeout(() => {
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 150); // Increased timeout slightly
        } else {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
        setIsMobileMenuOpen(false);
    };

    const scrollToTop = () => {
        if (location.pathname !== "/") {
            navigate("/");
        }
        // Always scroll top, even if already on home page
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsMobileMenuOpen(false);
    };

    // --- Auth Navigation ---
    const handleLogin = () => { navigate("/login"); setIsMobileMenuOpen(false); };
    const handleSignup = () => { navigate("/signup"); setIsMobileMenuOpen(false); };

    // --- UPDATED LOGOUT HANDLER ---
    const handleLogout = () => {
        setIsMobileMenuOpen(false);
        const toastId = toast.loading("Logging out...");
        try {
            // REMOVE: await api.get("/api/auth/logout"); // No backend call

            // Clear token from localStorage and context state
            setToken(null);
            // Clear user from context state
            setUser(null);

            toast.success("Logged out successfully", { id: toastId });
            navigate("/"); // Redirect to home
        } catch (error) { // Should not happen now
            console.error("Logout error (unexpected):", error);
            toast.error("Logout failed.", { id: toastId });
        }
    };
    // --- END UPDATED LOGOUT HANDLER ---

    // --- Render Auth Buttons (No changes needed here) ---
    const renderAuthButtons = (isMobile: boolean = false) => {
        if (isLoading) {
            return (
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
                    {/* Simplified loading skeleton */}
                    <div className="h-8 w-16 animate-pulse rounded-full bg-gray-700"></div>
                    <div className="h-8 w-20 animate-pulse rounded-full bg-gray-600"></div>
                </div>
            );
        }

        if (user) {
            // User is logged in
            return (
                <div className={`flex ${isMobile ? 'flex-col gap-4 items-stretch' : 'items-center gap-4'}`}>
                    <span className={`flex items-center gap-2 text-gray-300 ${isMobile ? 'justify-center py-2' : ''}`}>
                        <UserIcon className="h-5 w-5 text-primary" />
                        {/* Truncate long usernames if needed */}
                        <span className="truncate max-w-[100px] md:max-w-[150px]">{user.username}</span>
                    </span>
                    <motion.button
                        onClick={handleLogout}
                        className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full ${isMobile ? 'w-full py-4 text-lg' : 'px-6 py-2.5 text-sm'} bg-gray-700 font-semibold text-white transition-all hover:bg-gray-600`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </motion.button>
                </div>
            );
        }

        // User is logged out
        return (
            <div className={`flex ${isMobile ? 'flex-col gap-4 items-stretch' : 'items-center gap-2'}`}>
                <motion.button
                    onClick={handleLogin}
                    className={`rounded-full px-6 py-2.5 font-semibold text-gray-300 transition-colors hover:text-white ${isMobile ? 'w-full py-4 text-lg text-center bg-gray-700 hover:bg-gray-600' : 'text-sm'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Log In
                </motion.button>
                <motion.button
                    onClick={handleSignup}
                    className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary font-semibold text-black transition-all hover:shadow-lg hover:shadow-primary/40 ${isMobile ? 'w-full py-4 text-lg' : 'px-6 py-2.5 text-sm'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Sparkles icon might be too much for signup, consider UserPlus */}
                    {/* <Sparkles className="h-4 w-4" /> */}
                    Sign Up
                </motion.button>
            </div>
        );
    };

    return (
        <>
            <motion.nav
                className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-[#1E293B]/80 py-3 shadow-lg shadow-black/10 backdrop-blur-xl"
                        : "bg-transparent py-5"
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.button
                            onClick={scrollToTop}
                            className="flex items-center gap-2 transition-transform hover:scale-105" // Reduced gap
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Placeholder SVG Logo - Replace with your actual SVG if possible */}
                             <svg className={`transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'} w-auto text-primary`} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M10 30L13.3333 25M30 30L26.6667 25M10 10H30L20 25L10 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                               <path d="M16.6667 10L20 15L23.3333 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                             </svg>
                             <span className={`text-xl font-bold text-white transition-opacity duration-300 ${isScrolled ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>CodeSync</span> {/* Hide text on mobile when scrolled */}
                        </motion.button>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center gap-1 md:flex">
                            {navLinks.map((link, index) => (
                                <motion.button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.href)}
                                    className="group relative px-4 py-2 text-gray-300 transition-colors hover:text-white"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {link.name}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-green-300 origin-center" // Use origin-center
                                        initial={{ scaleX: 0 }}
                                        // Animate based on activeSection OR hover
                                        animate={{ scaleX: activeSection === link.href.substring(1) ? 1 : 0 }}
                                        whileHover={{ scaleX: 1 }} // Always show full underline on hover
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex">
                            {renderAuthButtons(false)}
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center justify-center rounded-lg border border-gray-700 bg-darkHover/50 p-2 backdrop-blur-sm transition-colors hover:border-primary/50 md:hidden"
                            whileTap={{ scale: 0.9 }}
                            aria-label="Toggle mobile menu" // Accessibility
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div key="close" /* ... animation ... */ >
                                        <X className="h-6 w-6 text-white" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" /* ... animation ... */ >
                                        <Menu className="h-6 w-6 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>

                {/* Glowing Border Effect */}
                {isScrolled && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-xs border-l border-gray-700 bg-[#1E293B]/95 backdrop-blur-xl md:hidden overflow-y-auto" // Added max-w-xs and overflow
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between border-b border-gray-700 p-5"> {/* Adjusted padding */}
                                <div className="flex items-center gap-2">
                                     {/* Placeholder SVG Logo */}
                                     <svg className="h-8 w-auto text-primary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                       <path d="M10 30L13.3333 25M30 30L26.6667 25M10 10H30L20 25L10 10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                       <path d="M16.6667 10L20 15L23.3333 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                     </svg>
                                    <span className="text-lg font-bold text-white">CodeSync</span>
                                </div>
                                <motion.button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-darkHover hover:text-white"
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Close mobile menu" // Accessibility
                                >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>

                            {/* Mobile Menu Links */}
                            <div className="flex flex-col p-4"> {/* Adjusted padding */}
                                {navLinks.map((link, index) => (
                                    <motion.button
                                        key={link.name}
                                        onClick={() => scrollToSection(link.href)}
                                        className="group flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-darkHover" // Adjusted padding
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 + 0.1 }} // Adjusted delay
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-base text-gray-300 transition-colors group-hover:text-white"> {/* Adjusted text size */}
                                            {link.name}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                    </motion.button>
                                ))}

                                {/* Mobile Auth Buttons */}
                                <div className="mt-6 border-t border-gray-700 pt-6">
                                     {renderAuthButtons(true)}
                                </div>

                                {/* Decorative Element Removed for simplicity */}
                            </div>

                            {/* Decorative Gradient Removed for simplicity */}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

