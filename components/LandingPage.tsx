import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { FeatureAIIcon } from './icons/FeatureAIIcon';
import { FeatureMessageIcon } from './icons/FeatureMessageIcon';
import { FeatureVitalsIcon } from './icons/FeatureVitalsIcon';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
    onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode; gradient: string }> = ({ icon, title, children, gradient }) => (
    <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-sky-500/10 to-indigo-600/10 rounded-2xl transition-opacity duration-300"></div>
        <div className={`relative ${gradient} w-16 h-16 flex items-center justify-center rounded-xl mb-6 shadow-lg`}>
            {icon}
        </div>
        <h3 className="relative text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
        <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
    </div>
);

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
     <div className="relative pl-16 group">
        <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center text-white font-bold bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            {number}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200 antialiased">
            {/* Header */}
            <header className="backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 sticky top-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <a href="#" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 rounded-xl transition-all hover:scale-105">
                    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                        <LogoIcon className="h-6 w-6 text-white"/>
                    </div>
                    <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Beanhealth</h1>
                </a>
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <ThemeToggle />
                    <button onClick={onGetStarted} className="px-5 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-sky-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-700 hover:border-sky-400 dark:hover:border-sky-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">
                        Sign In
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative text-center py-24 md:py-32 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-100/50 via-transparent to-indigo-100/50 dark:from-sky-900/20 dark:via-transparent dark:to-indigo-900/20"></div>
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-100 dark:bg-sky-900/30 rounded-full text-sm font-semibold text-sky-700 dark:text-sky-300 mb-8 animate-fade-in">
                            <span className="animate-pulse w-2 h-2 bg-sky-500 rounded-full"></span>
                            <span>Trusted by healthcare professionals</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 dark:text-white mb-6 leading-tight animate-slide-up">
                            Better Care for <br />
                            <span className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Chronic Patients</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed animate-fade-in">
                            Real-time remote monitoring that connects you with your doctor instantly. Get personalized care through text, voice or video—whenever you need it.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                            <button onClick={onGetStarted} className="group relative px-8 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden">
                                <span className="relative z-10">Get Started for Free</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                    {/* Floating elements for visual interest */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300/20 dark:bg-sky-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 animate-fade-in">
                            <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                                A smarter way to manage your health
                            </h3>
                            <p className="text-xl text-slate-600 dark:text-slate-400 mt-3">
                                All the tools you need for a clearer health picture
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
                            <FeatureCard 
                                icon={<FeatureVitalsIcon className="w-8 h-8 text-white" />} 
                                title="Track Your Vitals"
                                gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                            >
                                Effortlessly log and visualize your key health metrics like blood pressure and heart rate to see your progress over time.
                            </FeatureCard>
                            <FeatureCard 
                                icon={<FeatureAIIcon className="w-8 h-8 text-white" />} 
                                title="AI-Powered Summaries"
                                gradient="bg-gradient-to-br from-sky-500 to-indigo-600"
                            >
                                Turn complex medical documents into easy-to-understand summaries. Our AI helps you grasp the key takeaways from your records instantly.
                            </FeatureCard>
                            <FeatureCard 
                                icon={<FeatureMessageIcon className="w-8 h-8 text-white" />} 
                                title="Secure Doctor Messaging"
                                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                            >
                                Communicate directly and securely with your care team. Ask questions and get the information you need, when you need it.
                            </FeatureCard>
                        </div>
                    </div>
                </section>
                
                {/* How it works Section */}
                <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16 animate-fade-in">
                            <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                                Get Started in 3 Simple Steps
                            </h3>
                            <p className="text-xl text-slate-600 dark:text-slate-400">
                                Begin your health journey today
                            </p>
                        </div>
                        <div className="space-y-12 animate-slide-up">
                           <StepCard number="1" title="Create Your Secure Account">
                               Sign up in minutes to create your private health profile. Your data is encrypted and protected with bank-level security.
                           </StepCard>
                           <StepCard number="2" title="Upload Your Medical Records">
                               Easily upload documents, lab results, or even snap a picture with your camera. Our AI will organize and analyze them for you.
                           </StepCard>
                           <StepCard number="3" title="Gain Valuable Insights">
                               View your personalized dashboard, read AI-generated summaries, track vitals, and share progress with your doctor in real-time.
                           </StepCard>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative py-24 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                     <div className="relative z-10 text-center max-w-3xl mx-auto text-white">
                        <h3 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in">
                            Ready to Build a Clearer Health Picture?
                        </h3>
                        <p className="text-xl mb-10 text-sky-50 leading-relaxed animate-slide-up">
                            Join thousands of patients who have transformed how they interact with their health information. It's free to get started.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-scale-in">
                            <button onClick={onGetStarted} className="group relative px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-glow-lg hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden">
                                <span className="relative z-10">Create My Account</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button className="px-10 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm">
                                Learn More
                            </button>
                        </div>
                     </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 md:px-12 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-2 rounded-xl">
                                <LogoIcon className="h-6 w-6 text-white"/>
                            </div>
                            <h1 className="text-xl font-display font-bold text-white">Beanhealth</h1>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                            <a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-sky-400 transition-colors">Contact Us</a>
                            <a href="#" className="hover:text-sky-400 transition-colors">Help Center</a>
                        </div>
                    </div>
                    <div className="text-center text-sm text-slate-500 pt-6 border-t border-slate-800">
                        <p>&copy; 2024 Beanhealth. All rights reserved. Built with care for better health outcomes.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;