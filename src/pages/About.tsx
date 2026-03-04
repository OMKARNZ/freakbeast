import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[#ffeadb]">
            {/* Navigation */}
            <header className="w-full bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-bold text-lg drop-shadow-md">
                            fb.
                        </div>
                        <span className="font-bold text-[#1a1a1a] tracking-wider text-xl">FreakBeast</span>
                    </Link>
                    <nav className="flex items-center gap-8 text-xs font-bold tracking-[0.15em] text-[#1a1a1a]">
                        <Link to="/" className="hover:text-[#f97316] transition-colors">HOME</Link>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-16 animate-fade-in">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-50 rotate-12">
                        <Dumbbell className="w-10 h-10 text-[#f97316] -rotate-12" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight mb-6">About FreakBeast</h1>
                    <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        We believe fitness tracking shouldn't be complicated. We built FreakBeast to give you a clean, simple, and powerful way to crush your goals.
                    </p>
                </div>

                <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-gray-50 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We started FreakBeast because we were tired of cluttered, ad-filled fitness apps that made working out feel like a chore. Our mission is to provide an elegant, premium experience that gets out of your way and lets you focus on what matters: the lift.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">What We Offer</h2>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 mt-2 rounded-full bg-[#f97316] flex-shrink-0" />
                                <span><strong>Custom Workouts:</strong> Create personalized routines that fit your exact needs.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 mt-2 rounded-full bg-[#f97316] flex-shrink-0" />
                                <span><strong>Goal Tracking:</strong> Set targets and let our system keep you accountable.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 mt-2 rounded-full bg-[#f97316] flex-shrink-0" />
                                <span><strong>Detailed Analytics:</strong> Understand your progress with easy-to-read charts and metrics.</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 px-6 border-t border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            fb.
                        </div>
                        <span className="font-bold text-[#1a1a1a] tracking-wider text-xl">FreakBeast</span>
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold tracking-[0.15em] text-[#a0a0a0]">
                        <Link to="/privacy" className="hover:text-[#f97316] transition-colors">PRIVACY</Link>
                        <Link to="/terms" className="hover:text-[#f97316] transition-colors">TERMS</Link>
                    </nav>
                    <p className="text-xs font-medium text-[#a0a0a0]">
                        © {new Date().getFullYear()} FreakBeast. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default About;
