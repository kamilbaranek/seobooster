import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';

interface WebData {
    id: string;
    url: string;
    onboardingStep: number;
}

const WizardPage = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [webId, setWebId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectType: 'commercial',
        url: '',
        webAge: 'new',
        platform: 'wordpress',
        wpUsername: '',
        wpApplicationPassword: '',
        businessGoal: '',
        audience: { keywords: '', tone: 'professional' },
        competitors: { urls: [] as string[] },
        conversionGoal: ''
    });

    useEffect(() => {
        if (!getToken()) {
            router.replace('/login');
        }
        // Check for existing webId in query or fetch latest pending web
        const queryWebId = router.query.webId as string;
        if (queryWebId) {
            setWebId(queryWebId);
            // Fetch web details to resume step
        }
    }, [router]);

    const handleNext = async () => {
        setLoading(true);
        try {
            let currentWebId = webId;

            if (currentStep === 2 && !currentWebId) {
                // Create web if not exists (Step 2 has URL)
                const web = await apiFetch<WebData>('/webs', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: formData.url,
                        nickname: formData.url, // Default nickname
                        projectType: formData.projectType
                    })
                });
                currentWebId = web.id;
                setWebId(web.id);
            }

            if (currentWebId) {
                // Handle Credentials for Step 3
                if (currentStep === 3 && formData.platform === 'wordpress') {
                    await apiFetch(`/webs/${currentWebId}/credentials`, {
                        method: 'POST',
                        body: JSON.stringify({
                            credentials: {
                                type: 'wordpress_application_password',
                                url: formData.url,
                                username: formData.wpUsername,
                                applicationPassword: formData.wpApplicationPassword
                            }
                        })
                    });
                }

                // Save other data (exclude temp fields)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { wpUsername, wpApplicationPassword, ...dataToSave } = formData;

                await apiFetch(`/webs/${currentWebId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        ...dataToSave,
                        onboardingStep: currentStep
                    })
                });
            }

            if (currentStep < 7) {
                setCurrentStep(prev => prev + 1);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            // Show error
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <>
            <Head>
                <title>SEO Booster – Onboarding</title>
            </Head>
            <DashboardLayout>
                <div className="d-flex flex-column flex-center flex-column-fluid">
                    <div className="w-100 mw-800px">
                        {/* Stepper Nav */}
                        <div className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid" id="kt_create_account_stepper">
                            <div className="d-flex justify-content-center flex-wrap mb-10">
                                {[1, 2, 3, 4, 5, 6, 7].map(step => (
                                    <div key={step} className={`stepper-item mx-2 my-4 ${currentStep === step ? 'current' : ''} ${currentStep > step ? 'completed' : ''}`}>
                                        <div className="stepper-wrapper d-flex align-items-center">
                                            <div className="stepper-icon w-40px h-40px">
                                                <i className="stepper-check fas fa-check"></i>
                                                <span className="stepper-number">{step}</span>
                                            </div>
                                            {/* Label could go here */}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Form Content */}
                            <form className="card d-flex flex-row-fluid flex-center">
                                <div className="card-body py-20 w-100 mw-xl-700px px-9">
                                    {/* Step 1: Project Type */}
                                    {currentStep === 1 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold d-flex align-items-center text-gray-900">Project Type</h2>
                                                    <div className="text-muted fw-semibold fs-6">Choose the type of your project.</div>
                                                </div>
                                                <div className="fv-row">
                                                    <div className="row">
                                                        <div className="col-lg-6">
                                                            <input type="radio" className="btn-check" name="projectType" value="commercial" checked={formData.projectType === 'commercial'} onChange={() => setFormData({ ...formData, projectType: 'commercial' })} id="pt_commercial" />
                                                            <label className="btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10" htmlFor="pt_commercial">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Commercial</span>
                                                                    <span className="text-muted fw-semibold fs-6">For business and profit</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <div className="col-lg-6">
                                                            <input type="radio" className="btn-check" name="projectType" value="non_commercial" checked={formData.projectType === 'non_commercial'} onChange={() => setFormData({ ...formData, projectType: 'non_commercial' })} id="pt_non_commercial" />
                                                            <label className="btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10" htmlFor="pt_non_commercial">
                                                                <i className="ki-outline ki-user fs-3x me-5"></i>
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Non-commercial</span>
                                                                    <span className="text-muted fw-semibold fs-6">Personal or non-profit</span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Web Info */}
                                    {currentStep === 2 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Website Details</h2>
                                                </div>
                                                <div className="mb-10 fv-row">
                                                    <label className="form-label mb-3">Website URL</label>
                                                    <input type="url" className="form-control form-control-lg form-control-solid" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" />
                                                </div>
                                                <div className="mb-10 fv-row">
                                                    <label className="d-flex align-items-center form-label mb-3">Website Age</label>
                                                    <div className="row mb-2">
                                                        <div className="col">
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.webAge === 'new' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="webAge" value="new" checked={formData.webAge === 'new'} onChange={() => setFormData({ ...formData, webAge: 'new' })} />
                                                                <span className="fw-bold fs-3">New</span>
                                                            </label>
                                                        </div>
                                                        <div className="col">
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.webAge === 'history' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="webAge" value="history" checked={formData.webAge === 'history'} onChange={() => setFormData({ ...formData, webAge: 'history' })} />
                                                                <span className="fw-bold fs-3">History</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-10 fv-row">
                                                    <label className="d-flex align-items-center form-label mb-3">Platform</label>
                                                    <div className="row mb-2">
                                                        {['wordpress', 'shopify', 'wix', 'other'].map(p => (
                                                            <div className="col-6 mb-2" key={p}>
                                                                <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.platform === p ? 'active' : ''}`}>
                                                                    <input type="radio" className="btn-check" name="platform" value={p} checked={formData.platform === p} onChange={() => setFormData({ ...formData, platform: p })} />
                                                                    <span className="fw-bold fs-3 text-capitalize">{p}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Connection */}
                                    {currentStep === 3 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Connection Details</h2>
                                                    <div className="text-muted fw-semibold fs-6">Connect your website to automate publishing.</div>
                                                </div>
                                                {formData.platform === 'wordpress' ? (
                                                    <div className="mb-10 fv-row">
                                                        <div className="alert alert-primary d-flex align-items-center p-5 mb-10">
                                                            <i className="ki-outline ki-shield-tick fs-2hx text-primary me-4"></i>
                                                            <div className="d-flex flex-column">
                                                                <h4 className="mb-1 text-primary">WordPress Application Password</h4>
                                                                <span>We use Application Passwords to securely connect to your WordPress site.</span>
                                                            </div>
                                                        </div>
                                                        {/* Placeholder for WP Credentials Form - In real implementation, we might want to use a separate component or fields */}
                                                        <div className="mb-5">
                                                            <label className="form-label">Username</label>
                                                            <input type="text" className="form-control form-control-solid" placeholder="WP Username" value={formData.wpUsername} onChange={(e) => setFormData({ ...formData, wpUsername: e.target.value })} />
                                                        </div>
                                                        <div className="mb-5">
                                                            <label className="form-label">Application Password</label>
                                                            <input type="password" className="form-control form-control-solid" placeholder="xxxx xxxx xxxx xxxx" value={formData.wpApplicationPassword} onChange={(e) => setFormData({ ...formData, wpApplicationPassword: e.target.value })} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="alert alert-info d-flex align-items-center p-5">
                                                        <i className="ki-outline ki-information-5 fs-2hx text-info me-4"></i>
                                                        <div className="d-flex flex-column">
                                                            <h4 className="mb-1 text-info">Manual Integration</h4>
                                                            <span>For {formData.platform}, we will provide content that you can copy and paste.</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Business Goals */}
                                    {currentStep === 4 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Business Goals</h2>
                                                    <div className="text-muted fw-semibold fs-6">What do you want to achieve with SEO?</div>
                                                </div>
                                                <div className="fv-row">
                                                    {['Increase Traffic', 'Get More Customers', 'Build Authority', 'Provide Information'].map(goal => (
                                                        <div className="mb-5" key={goal}>
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary d-flex align-items-center p-5 ${formData.businessGoal === goal ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="businessGoal" value={goal} checked={formData.businessGoal === goal} onChange={() => setFormData({ ...formData, businessGoal: goal })} />
                                                                <span className="fw-semibold fs-5">{goal}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                    <div className="mb-5">
                                                        <label className="form-label">Other</label>
                                                        <input type="text" className="form-control form-control-solid" placeholder="Describe your goal..." onChange={(e) => setFormData({ ...formData, businessGoal: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Audience */}
                                    {currentStep === 5 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Target Audience</h2>
                                                    <div className="text-muted fw-semibold fs-6">Who are we writing for?</div>
                                                </div>
                                                <div className="fv-row mb-10">
                                                    <label className="form-label">Keywords</label>
                                                    <input type="text" className="form-control form-control-solid" placeholder="e.g. seo, marketing, business" value={formData.audience.keywords} onChange={(e) => setFormData({ ...formData, audience: { ...formData.audience, keywords: e.target.value } })} />
                                                </div>
                                                <div className="fv-row mb-10">
                                                    <label className="form-label">Tone of Voice</label>
                                                    <select className="form-select form-select-solid" value={formData.audience.tone} onChange={(e) => setFormData({ ...formData, audience: { ...formData.audience, tone: e.target.value } })}>
                                                        <option value="professional">Professional</option>
                                                        <option value="casual">Casual</option>
                                                        <option value="friendly">Friendly</option>
                                                        <option value="authoritative">Authoritative</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Competitors */}
                                    {currentStep === 6 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Competitors</h2>
                                                    <div className="text-muted fw-semibold fs-6">List your main competitors (Optional).</div>
                                                </div>
                                                <div className="fv-row">
                                                    <textarea className="form-control form-control-solid" rows={5} placeholder="Enter competitor URLs, one per line..." value={formData.competitors.urls.join('\n')} onChange={(e) => setFormData({ ...formData, competitors: { urls: e.target.value.split('\n') } })}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 7: Conversion Goals */}
                                    {currentStep === 7 && (
                                        <div className="current">
                                            <div className="w-100">
                                                <div className="pb-10 pb-lg-15">
                                                    <h2 className="fw-bold text-gray-900">Conversion Goals</h2>
                                                    <div className="text-muted fw-semibold fs-6">What should the user do after reading?</div>
                                                </div>
                                                <div className="fv-row">
                                                    {['Submit Inquiry', 'Call Us', 'Make a Purchase', 'Book Appointment', 'Read More Content'].map(action => (
                                                        <div className="mb-5" key={action}>
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary d-flex align-items-center p-5 ${formData.conversionGoal === action ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="conversionGoal" value={action} checked={formData.conversionGoal === action} onChange={() => setFormData({ ...formData, conversionGoal: action })} />
                                                                <span className="fw-semibold fs-5">{action}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex flex-stack pt-15">
                                        <div className="mr-2">
                                            {currentStep > 1 && (
                                                <button type="button" className="btn btn-lg btn-light-primary me-3" onClick={handleBack}>
                                                    <i className="ki-outline ki-arrow-left fs-4 me-1"></i> Back
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <button type="button" className="btn btn-lg btn-primary" onClick={handleNext} disabled={loading}>
                                                {loading ? 'Please wait...' : (
                                                    <>
                                                        {currentStep === 7 ? 'Submit' : 'Next'} <i className="ki-outline ki-arrow-right fs-4 ms-1"></i>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default WizardPage;
