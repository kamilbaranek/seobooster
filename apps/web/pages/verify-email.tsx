import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '../lib/auth-storage';

const VerifyEmailPage = () => {
    const router = useRouter();
    const [themeMode, setThemeMode] = useState('light');

    useEffect(() => {
        if (!getToken()) {
            router.replace('/login');
        }

        // Theme detection logic from template
        const defaultThemeMode = "light";
        let mode = defaultThemeMode;
        if (typeof window !== 'undefined') {
            if (document.documentElement.hasAttribute("data-bs-theme-mode")) {
                mode = document.documentElement.getAttribute("data-bs-theme-mode") || defaultThemeMode;
            } else {
                if (localStorage.getItem("data-bs-theme") !== null) {
                    mode = localStorage.getItem("data-bs-theme") || defaultThemeMode;
                }
            }
            if (mode === "system") {
                mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
            setThemeMode(mode);
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>SEO Booster – Verify your email</title>
            </Head>
            <div className="d-flex flex-column flex-root" id="kt_app_root">
                <style jsx global>{`
          body { background-image: url('/assets/media/auth/bg5.jpg'); }
          [data-bs-theme="dark"] body { background-image: url('/assets/media/auth/bg5-dark.jpg'); }
        `}</style>

                <div className="d-flex flex-column flex-center flex-column-fluid">
                    <div className="d-flex flex-column flex-center text-center p-10">
                        <div className="card card-flush w-lg-650px py-5">
                            <div className="card-body py-15 py-lg-20">
                                <div className="mb-14">
                                    <Link href="/" className="">
                                        <img alt="Logo" src="/assets/media/logos/custom-2.svg" className="h-40px" />
                                    </Link>
                                </div>

                                <h1 className="fw-bolder text-gray-900 mb-5">Verify your email</h1>

                                <div className="fs-6 mb-8">
                                    <span className="fw-semibold text-gray-500">Did’t receive an email?</span>
                                    <a href="#" className="link-primary fw-bold ms-1">Try Again</a>
                                </div>

                                <div className="mb-11">
                                    <Link href="/onboarding/wizard" className="btn btn-sm btn-primary">Skip for now</Link>
                                </div>

                                <div className="mb-0">
                                    <img src="/assets/media/auth/please-verify-your-email.png" className={`mw-100 mh-300px ${themeMode === 'light' ? '' : 'd-none'}`} alt="" />
                                    <img src="/assets/media/auth/please-verify-your-email-dark.png" className={`mw-100 mh-300px ${themeMode === 'dark' ? '' : 'd-none'}`} alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmailPage;
