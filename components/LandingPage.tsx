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

const FeatureCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400">{children}</p>
    </div>
);

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
     <div className="relative pl-12">
        <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
            {number}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const { theme } = useTheme();

    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 antialiased">
            {/* Header */}
            <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <a href="#" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 rounded-md">
                    <LogoIcon className="h-8 w-8 text-indigo-600"/>
                    <h1 className="text-2xl font-bold">Beanhealth</h1>
                </a>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <ThemeToggle />
                    <button onClick={onGetStarted} className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                        Sign In
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-6">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">Better Care for Chronic Patients.</h2>
                    <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-8">
                        Beanhealth provides Real-time remote monitoring that connects you with your doctor instantly. Get personilized care through text, voice or video-whenever you need it. 
                    </p>
                    <button onClick={onGetStarted} className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105">
                        Get Started for Free
                    </button>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6 bg-white dark:bg-slate-800/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">A smarter way to manage your health</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">All the tools you need for a clearer health picture.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<FeatureVitalsIcon />} title="Track Your Vitals">
                                Effortlessly log and visualize your key health metrics like blood pressure and heart rate to see your progress over time.
                            </FeatureCard>
                            <FeatureCard icon={<FeatureAIIcon />} title="AI-Powered Summaries">
                                Turn complex medical documents into easy-to-understand summaries. Our AI helps you grasp the key takeaways from your records instantly.
                            </FeatureCard>
                            <FeatureCard icon={<FeatureMessageIcon />} title="Secure Doctor Messaging">
                                Communicate directly and securely with your care team. Ask questions and get the information you need, when you need it.
                            </FeatureCard>
                        </div>
                    </div>
                </section>
                
                {/* How it works Section */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Get Started in 3 Simple Steps</h3>
                        </div>
                        <div className="grid md:grid-cols-1 gap-12">
                           <StepCard number="1" title="Create Your Secure Account">
                               Sign up in minutes to create your private health profile. Your data is encrypted and protected.
                           </StepCard>
                           <StepCard number="2" title="Upload Your Medical Records">
                               Easily upload documents, lab results, or even snap a picture with your camera. We'll organize them for you.
                           </StepCard>
                           <StepCard number="3" title="Gain Valuable Insights">
                               View your personalized dashboard, read AI-generated summaries, and share progress with your doctor.
                           </StepCard>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-indigo-600 text-white py-20 px-6">
                     <div className="text-center max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold mb-4">Ready to Build a Clearer Health Picture?</h3>
                        <p className="mb-8 text-indigo-100">
                            Join today and transform how you interact with your health information. It's free to get started.
                        </p>
                        <button onClick={onGetStarted} className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-slate-100 transition-all transform hover:scale-105">
                            Create My Account
                        </button>
                     </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 px-6 md:px-12 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                    <p>&copy; 2024 Beanhealth. All rights reserved.</p>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;