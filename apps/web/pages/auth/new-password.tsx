import { FormEvent, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';

const NewPasswordPage = () => {
    const router = useRouter();
    const { token } = router.query;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Password strength meter state (simplified)
    const [meterScore, setMeterScore] = useState(0);

    useEffect(() => {
        // Simple password strength calculation
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        setMeterScore(score);
    }, [password]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setLoading(true);

        try {
            await apiFetch('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password }),
                skipAuth: true
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>SEO Booster – Setup New Password</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
                <link href="/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
                <link href="/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
                <style>{`
          html, body, #__next {
            height: 100%;
          }
        `}</style>
            </Head>

            <div id="kt_body" className="app-blank h-100">
                <div className="d-flex flex-column flex-root h-100" id="kt_app_root">
                    <div className="d-flex flex-column flex-lg-row flex-column-fluid">
                        <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
                            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
                                <div className="w-lg-500px p-10">
                                    {success ? (
                                        <div className="text-center mb-10">
                                            <h1 className="text-gray-900 fw-bolder mb-3">Password Reset Successful</h1>
                                            <div className="text-gray-500 fw-semibold fs-6">
                                                Your password has been successfully reset. Redirecting to login...
                                            </div>
                                            <div className="mt-10">
                                                <Link href="/login" className="btn btn-primary">Sign In Now</Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <form className="form w-100" noValidate id="kt_new_password_form" onSubmit={handleSubmit}>
                                            <div className="text-center mb-10">
                                                <h1 className="text-gray-900 fw-bolder mb-3">Setup New Password</h1>
                                                <div className="text-gray-500 fw-semibold fs-6">
                                                    Have you already reset the password ?{' '}
                                                    <Link href="/login" className="link-primary fw-bold">Sign in</Link>
                                                </div>
                                            </div>

                                            <div className="fv-row mb-8" data-kt-password-meter="true">
                                                <div className="mb-1">
                                                    <div className="position-relative mb-3">
                                                        <input
                                                            className="form-control bg-transparent"
                                                            type="password"
                                                            placeholder="Password"
                                                            name="password"
                                                            autoComplete="off"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                        <span className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2">
                                                            <i className="ki-outline ki-eye-slash fs-2"></i>
                                                            <i className="ki-outline ki-eye fs-2 d-none"></i>
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className={`flex-grow-1 rounded h-5px me-2 ${meterScore >= 1 ? 'bg-success' : 'bg-secondary'}`}></div>
                                                        <div className={`flex-grow-1 rounded h-5px me-2 ${meterScore >= 2 ? 'bg-success' : 'bg-secondary'}`}></div>
                                                        <div className={`flex-grow-1 rounded h-5px me-2 ${meterScore >= 3 ? 'bg-success' : 'bg-secondary'}`}></div>
                                                        <div className={`flex-grow-1 rounded h-5px ${meterScore >= 4 ? 'bg-success' : 'bg-secondary'}`}></div>
                                                    </div>
                                                </div>
                                                <div className="text-muted">Use 8 or more characters with a mix of letters, numbers & symbols.</div>
                                            </div>

                                            <div className="fv-row mb-8">
                                                <input
                                                    type="password"
                                                    placeholder="Repeat Password"
                                                    name="confirm-password"
                                                    autoComplete="off"
                                                    className="form-control bg-transparent"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </div>

                                            <div className="fv-row mb-8">
                                                <label className="form-check form-check-inline">
                                                    <input className="form-check-input" type="checkbox" name="toc" value="1" />
                                                    <span className="form-check-label fw-semibold text-gray-700 fs-6 ms-1">
                                                        I Agree & <a href="#" className="ms-1 link-primary">Terms and conditions</a>.
                                                    </span>
                                                </label>
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger d-flex align-items-center p-5 mb-8">
                                                    <i className="ki-outline ki-shield-tick fs-2hx text-danger me-4"></i>
                                                    <div className="d-flex flex-column">
                                                        <h4 className="mb-1 text-danger">Error</h4>
                                                        <span>{error}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-grid mb-10">
                                                <button type="submit" id="kt_new_password_submit" className="btn btn-primary" disabled={loading}>
                                                    <span className="indicator-label">Submit</span>
                                                    {loading && (
                                                        <span className="indicator-progress" style={{ display: 'block' }}>
                                                            Please wait...
                                                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            <div className="w-lg-500px d-flex flex-stack px-10 mx-auto">
                                <div className="me-10">
                                    <button className="btn btn-flex btn-link btn-color-gray-700 btn-active-color-primary rotate fs-base" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start" data-kt-menu-offset="0px, 0px">
                                        <img data-kt-element="current-lang-flag" className="w-20px h-20px rounded me-3" src="/assets/media/flags/united-states.svg" alt="" />
                                        <span data-kt-element="current-lang-name" className="me-1">English</span>
                                        <span className="d-flex flex-center rotate-180">
                                            <i className="ki-outline ki-down fs-5 text-muted m-0"></i>
                                        </span>
                                    </button>
                                </div>
                                <div className="d-flex fw-semibold text-primary fs-base gap-5">
                                    <Link href="/terms" target="_blank">Terms</Link>
                                    <Link href="/contact" target="_blank">Contact Us</Link>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2" style={{ backgroundImage: 'url(/assets/media/misc/auth-bg.png)' }}>
                            <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
                                <Link href="/" className="mb-0 mb-lg-12">
                                    <img alt="Logo" src="/assets/media/logos/custom-1.png" className="h-60px h-lg-75px" />
                                </Link>
                                <img className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="/assets/media/misc/auth-screens.png" alt="" />
                                <h1 className="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">Fast, Efficient and Productive</h1>
                                <div className="d-none d-lg-block text-white fs-base text-center">
                                    In this kind of post,{' '}
                                    <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the blogger</a>
                                    introduces a person they’ve interviewed{' '}
                                    <br />
                                    and provides some background information about{' '}
                                    <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the interviewee</a>
                                    and their{' '}
                                    <br />
                                    work following this is a transcript of the interview.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewPasswordPage;
