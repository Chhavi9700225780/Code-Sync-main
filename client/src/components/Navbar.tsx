import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles, ChevronRight } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

import logo from "@/assets/logo.svg"
export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

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

    const handleGetStarted = () => {
        navigate("/get-started")
        setIsMobileMenuOpen(false)
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
                           <img
                                src={logo}
                                alt="Code Sync"
                                className="transition-all duration-300 h-16" 
                            />
                            
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
                                        whileHover={{ scaleX: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            ))}
                        </div>

                        {/* Desktop CTA Button */}
                        <motion.button
                            onClick={handleGetStarted}
                            className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-2.5 font-semibold text-black transition-all hover:shadow-lg hover:shadow-primary/40 md:flex"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-green-400 to-primary"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                            />
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started
                                <motion.div
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </motion.div>
                            </span>
                        </motion.button>

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
                                   <img
                                src={logo}
                                alt="Code Sync"
                                className="transition-all duration-300 h-16" 
                            />
                                    
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

                                {/* Mobile CTA */}
                                <motion.button
                                    onClick={handleGetStarted}
                                    className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-black shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Get Started Free
                                </motion.button>

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