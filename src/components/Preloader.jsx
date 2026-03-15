import React, { useEffect, useState } from 'react';

const Preloader = ({ onFinish }) => {
    const [stage, setStage] = useState(0);
    const text = "SharmaStore";
    const letters = text.split("");

    useEffect(() => {
        const slideUpTimer = setTimeout(() => {
            setStage(1);
        }, 1500); // Snappy: Slides up quickly

        const finishTimer = setTimeout(() => {
            setStage(2);
            if (onFinish) onFinish();
        }, 2000); // Unmounts shortly after

        return () => {
            clearTimeout(slideUpTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    if (stage === 2) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-transform duration-500 ease-in-out ${stage === 1 ? '-translate-y-full' : 'translate-y-0'}`}
            style={{ backgroundColor: '#FFFBF2' }} // Cream Paper
        >
            {/* --- Living Background Layers --- */}

            {/* 1. Dot Grid Texture (Clean) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}>
            </div>

            {/* 2. Floating Auras (Orbs) */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-blob mix-blend-multiply filter pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter pointer-events-none transform translate-x-1/2 translate-y-1/2"></div>

            {/* 3. Creative Dust (Doodles) */}
            <svg className="absolute top-[20%] left-[20%] w-6 h-6 text-slate-300 animate-float opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
            </svg>
            <svg className="absolute bottom-[30%] left-[15%] w-8 h-8 text-orange-200 animate-float animation-delay-1000 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 22h20L12 2z" />
            </svg>
            <svg className="absolute top-[40%] right-[15%] w-10 h-10 text-teal-100 animate-float animation-delay-500 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12c2-4 6-4 8 0s6 4 8 0" />
            </svg>

            {/* 4. Vignette / Spotlight */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(255, 251, 242, 0.8) 100%)' }}>
            </div>


            {/* --- Main Content --- */}
            <div className="relative z-10 p-4">
                <svg
                    viewBox="0 0 500 150"
                    className="w-[300px] h-[100px] md:w-[500px] md:h-[150px] overflow-visible"
                >
                    {/* Letters */}
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{ fontFamily: "'Sacramento', cursive", fontSize: '80px' }}
                    >
                        {letters.map((letter, index) => (
                            <tspan
                                key={index}
                                className="letter-draw"
                                style={{ animationDelay: `${index * 0.05}s` }} // Super fast stagger
                            >
                                {letter}
                            </tspan>
                        ))}
                    </text>
                </svg>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sacramento&display=swap');

                /* Text Animation - Faster */
                .letter-draw {
                    fill: transparent;
                    stroke: #1e293b;
                    stroke-width: 1.5px;
                    stroke-dasharray: 300;
                    stroke-dashoffset: 300;
                    opacity: 0;
                    animation: 
                        drawLetter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
                        fillLetter 0.5s ease-out 0.4s forwards;
                }
                
                @keyframes drawLetter {
                    0% { stroke-dashoffset: 300; opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 1; }
                }

                @keyframes fillLetter {
                    0%, 70% { fill: transparent; stroke: #1e293b; }
                    100% { fill: #1e293b; stroke: transparent; }
                }

                /* --- Dynamic Background Animations --- */
                
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-1000 { animation-delay: 1s; }

            `}</style>
        </div>
    );
};

export default Preloader;
