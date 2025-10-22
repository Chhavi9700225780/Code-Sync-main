import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles, ChevronRight, LogOut, User as UserIcon } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth, api } from "../context/AuthContext" // <-- Import auth context
import toast from "react-hot-toast"

// Assuming you have a logo file at this path
// If not, you might need to adjust or remove this import
// import logo from "@/assets/logo.svg" 

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("")
    
    const navigate = useNavigate()
    const location = useLocation()
    
    // Get auth state from context
    const { user, setUser, isLoading } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)

            // Only track sections on home page
            if (location.pathname !== "/") return

            // Detect active section
            const sections = ["features", "how-it-works", "about"]
            const scrollPosition = window.scrollY + 100

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(section)
                        break
                    }
                }
            }

            // Reset active section when at top
            if (window.scrollY < 100) {
                setActiveSection("")
            }
        }
        
        handleScroll()
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [location.pathname])

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "About", href: "#about" },
    ]

    const scrollToSection = (href: string) => {
        // If not on home page, navigate to home first
        if (location.pathname !== "/") {
            navigate("/")
            setTimeout(() => {
                const element = document.querySelector(href)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" })
                }
            }, 100)
        } else {
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" })
            }
        }
        setIsMobileMenuOpen(false)
    }

    const scrollToTop = () => {
        if (location.pathname !== "/") {
            navigate("/")
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
        setIsMobileMenuOpen(false)
    }

    // --- Auth Navigation ---
    const handleLogin = () => {
        navigate("/login")
        setIsMobileMenuOpen(false)
    }
    const handleSignup = () => {
        navigate("/signup")
        setIsMobileMenuOpen(false)
    }
    
    const handleLogout = async () => {
        setIsMobileMenuOpen(false)
        const toastId = toast.loading("Logging out...")
        try {
            await api.get("/api/auth/logout") // Use the api instance
            setUser(null) // Clear user from global state
            toast.success("Logged out successfully", { id: toastId })
            navigate("/") // Redirect to home
        } catch (error) {
            console.error("Logout failed:", error)
            toast.error("Logout failed. Please try again.", { id: toastId })
        }
    }

    // --- Render Auth Buttons ---
    const renderAuthButtons = (isMobile: boolean = false) => {
        if (isLoading) {
            return (
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
                    <div className="h-8 w-24 animate-pulse rounded-full bg-gray-700"></div>
                </div>
            )
        }

        if (user) {
            // User is logged in
            return (
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-4'}`}>
                    <span className="flex items-center gap-2 text-gray-300">
                        <UserIcon className="h-5 w-5 text-primary" />
                        {user.username}
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
            )
        }

        // User is logged out
        return (
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
                <motion.button
                    onClick={handleLogin}
                    className={`rounded-full px-6 py-2.5 font-semibold text-gray-300 transition-colors hover:text-white ${isMobile ? 'w-full py-4 text-lg' : 'text-sm'}`}
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
                    <Sparkles className="h-4 w-4" />
                    Sign Up
                </motion.button>
            </div>
        )
    }

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
                            className="flex items-center gap-3 transition-transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Using text logo as placeholder since asset path might be wrong */}
                            {/* <img
                                src={logo}
                                alt="Code Sync"
                                className="transition-all duration-300 h-16" 
                            /> */}
                            <span className="text-2xl font-bold text-white">CodeSync</span>
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
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-green-300"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: activeSection === link.href.substring(1) ? 1 : 0 }}
                                        whileHover={{ scaleX: 1 }}
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
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="h-6 w-6 text-white" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
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
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-gray-700 bg-[#1E293B]/95 backdrop-blur-xl md:hidden"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between border-b border-gray-700 p-6">
                                <div className="flex items-center gap-3">
                                    {/* <img
                                    src={logo}
                                    alt="Code Sync"
                                    className="transition-all duration-300 h-16" 
                                /> */}
                                <span className="text-xl font-bold text-white">CodeSync</span>
                                </div>
                                <motion.button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-darkHover hover:text-white"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>

                            {/* Mobile Menu Links */}
                            <div className="flex flex-col p-6">
                                {navLinks.map((link, index) => (
                                    <motion.button
                                        key={link.name}
                                        onClick={() => scrollToSection(link.href)}
                                        className="group flex items-center justify-between rounded-lg px-4 py-4 text-left transition-colors hover:bg-darkHover"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="text-lg text-gray-300 transition-colors group-hover:text-white">
                                            {link.name}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                    </motion.button>
                                ))}

                                {/* Mobile Auth Buttons */}
                                <div className="mt-6 border-t border-gray-700 pt-6">
                                    {renderAuthButtons(true)}
                                 </div>

                                {/* Decorative Element */}
                                <motion.div
                                    className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <p className="text-sm text-gray-400">
                                        Join thousands of developers building amazing projects
                                        together
                                    </p>
                                </motion.div>
                            </div>

                            {/* Decorative Gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

