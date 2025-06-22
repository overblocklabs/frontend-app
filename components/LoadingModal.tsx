"use client";
import Lottie from 'react-lottie';
import animationData1 from '../public/lottie/loading1.json'
import  animationData2 from '../public/lottie/loading2.json'
import { useEffect } from 'react';

export default function LoadingModal() {

    const anim = Math.floor(Math.random() * 0) + 1;

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: anim === 0 ? animationData1 : animationData2,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden'

        return () => {
        document.body.style.overflow = 'initial'
        }
    }, [])


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div
                className="bg-card-bg rounded-xl p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
                role="dialog"
                aria-labelledby="community-form-title"
                aria-modal="true"
            >
                <div className="flex justify-center items-center mb-8">
                    <h3 id="community-form-title" className="text-2xl font-bold text-primary">
                        Welcome to Lotellar!
                    </h3>

                </div>

                <Lottie options={defaultOptions}
                    height={200}
                    width={200}
                />

                    <h3 id="community-form-title" className="text-2xl font-bold text-primary text-center">
                        We are connecting your wallet please wait...
                    </h3>

            </div>
        </div>
    );
} 