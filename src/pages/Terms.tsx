import { Link } from 'react-router-dom';

const Terms = () => {
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
            <main className="max-w-3xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight mb-8">Terms of Service</h1>

                <div className="prose prose-orange max-w-none text-gray-600 bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
                    <p className="mb-6 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">
                        By accessing or using FreakBeast, you agree to comply with and be bound by these Terms.
                    </p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">2. Description of Service</h2>
                    <p className="mb-4">
                        FreakBeast is a fitness tracking platform that allows users to create workouts, set goals, and analyze their workout history.
                    </p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">3. User Conduct</h2>
                    <p className="mb-4">
                        You agree not to use the service for any unlawful purpose or in any way that might harm, damage, or disparage any other party.
                    </p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">4. Content Ownership</h2>
                    <p className="mb-4">
                        You retain all rights to the workout data you upload. We claim no intellectual property rights over the material you provide to the service.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Terms;
