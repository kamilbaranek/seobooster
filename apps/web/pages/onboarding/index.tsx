import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { saveToken, getToken } from '../../lib/auth-storage';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    webs: Array<{ id: string; url: string; status: string }>;
  };
}

const SignupPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
    }

    // Theme detection logic
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });

      saveToken(data.accessToken);
      // Redirect to onboarding wizard step 1
      router.push('/onboarding/wizard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Sign Up</title>
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

      <div className="d-flex flex-column flex-root h-100" id="kt_app_root">
        <div className="d-flex flex-column flex-lg-row flex-column-fluid">
          {/* Body */}
          <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
            {/* Form */}
            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
              {/* Wrapper */}
              <div className="w-lg-500px p-10">
                {/* Form */}
                <form className="form w-100" noValidate id="kt_sign_up_form" onSubmit={handleSubmit}>
                  {/* Heading */}
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Sign Up</h1>
                    <div className="text-gray-500 fw-semibold fs-6">Your Social Campaigns</div>
                  </div>

                  {/* Login options */}
                  <div className="row g-3 mb-9">
                    <div className="col-md-6">
                      <button type="button" className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100">
                        <img alt="Logo" src="/assets/media/svg/brand-logos/google-icon.svg" className="h-15px me-3" />Sign in with Google
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button type="button" className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100">
                        <img alt="Logo" src="/assets/media/svg/brand-logos/apple-black.svg" className="theme-light-show h-15px me-3" />
                        <img alt="Logo" src="/assets/media/svg/brand-logos/apple-black-dark.svg" className="theme-dark-show h-15px me-3" />Sign in with Apple
                      </button>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="separator separator-content my-14">
                    <span className="w-125px text-gray-500 fw-semibold fs-7">Or with email</span>
                  </div>

                  {/* Email */}
                  <div className="fv-row mb-8">
                    <input type="text" placeholder="Email" name="email" autoComplete="off" className="form-control bg-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  {/* Password */}
                  <div className="fv-row mb-8" data-kt-password-meter="true">
                    <div className="mb-1">
                      <div className="position-relative mb-3">
                        <input className="form-control bg-transparent" type="password" placeholder="Password" name="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <span className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2" data-kt-password-meter-control="visibility">
                          <i className="ki-outline ki-eye-slash fs-2"></i>
                          <i className="ki-outline ki-eye fs-2 d-none"></i>
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-3" data-kt-password-meter-control="highlight">
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
                      </div>
                    </div>
                    <div className="text-muted">Use 8 or more characters with a mix of letters, numbers & symbols.</div>
                  </div>

                  {/* Repeat Password */}
                  <div className="fv-row mb-8">
                    <input placeholder="Repeat Password" name="confirm-password" type="password" autoComplete="off" className="form-control bg-transparent" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>

                  {/* Accept Terms */}
                  <div className="fv-row mb-8">
                    <label className="form-check form-check-inline">
                      <input className="form-check-input" type="checkbox" name="toc" value="1" />
                      <span className="form-check-label fw-semibold text-gray-700 fs-base ms-1">I Accept the <a href="#" className="ms-1 link-primary">Terms</a></span>
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center p-5 mb-8">
                      <i className="ki-outline ki-shield-tick fs-2hx text-danger me-4"></i>
                      <div className="d-flex flex-column">
                        <h4 className="mb-1 text-danger">Registration Failed</h4>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="d-grid mb-10">
                    <button type="submit" id="kt_sign_up_submit" className="btn btn-primary" disabled={loading}>
                      {!loading && <span className="indicator-label">Sign up</span>}
                      {loading && (
                        <span className="indicator-progress" style={{ display: 'block' }}>Please wait...
                          <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                      )}
                    </button>
                  </div>

                  {/* Sign in link */}
                  <div className="text-gray-500 text-center fw-semibold fs-6">Already have an Account?
                    <Link href="/login" className="link-primary fw-semibold ms-1">Sign in</Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
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
                <a href="#" target="_blank">Terms</a>
                <a href="#" target="_blank">Plans</a>
                <a href="#" target="_blank">Contact Us</a>
              </div>
            </div>
          </div>

          {/* Aside */}
          <div className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2" style={{ backgroundImage: 'url(/assets/media/misc/auth-bg.png)' }}>
            <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
              <Link href="/" className="mb-0 mb-lg-12">
                <img alt="Logo" src="/assets/media/logos/custom-1.png" className="h-60px h-lg-75px" />
              </Link>
              <img className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="/assets/media/misc/auth-screens.png" alt="" />
              <h1 className="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">Fast, Efficient and Productive</h1>
              <div className="d-none d-lg-block text-white fs-base text-center">In this kind of post, <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the blogger</a>introduces a person they’ve interviewed <br />and provides some background information about <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the interviewee</a>and their <br />work following this is a transcript of the interview.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
