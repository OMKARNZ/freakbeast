import { Link } from 'react-router-dom';

const Privacy = () => {
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
                <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight mb-8">Privacy Policy</h1>

                <div className="prose prose-orange max-w-none text-gray-600 bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
                    <p className="mb-6 font-medium">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                        We collect information you provide directly to us when you create an account, track a workout, or communicate with us.
                        This may include your name, email address, fitness goals, and workout history.
                    </p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">
                        We use the information we collect to provide, maintain, and improve our services, including to personalize your workout recommendations and track your progress over time.
                    </p>

                    <h2 className="text-xl font-bold text-[#1a1a1a] mt-8 mb-4">3. Data Security</h2>
                    <p className="mb-4">
                        We use reasonable security measures backed by Supabase infrastructure to protect your personal information from unauthorized access or disclosure.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
