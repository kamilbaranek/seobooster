import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api-client';
import ImageEditorModal from './ImageEditorModal';

import { ArticlePlan } from './InboxTab';
import Swal from 'sweetalert2';

interface InboxDetailProps {
    article: ArticlePlan;
    onBack: () => void;
}

interface ArticleImage {
    id: string;
    articleId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    imageUrl?: string;
    prompt?: string;
    position: number;
    isFeatured: boolean;
    altText?: string;
    fileName?: string;
}

const InboxDetail: React.FC<InboxDetailProps> = ({ article, onBack }) => {
    const [images, setImages] = useState<ArticleImage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

    const fetchImages = async () => {
        if (article.webId && article.articleId) {
            try {
                const data = await apiFetch<{ images: ArticleImage[], remaining: number }>(`/webs/${article.webId}/articles/${article.articleId}/images`);
                setImages((data.images || []).filter(img => img.status !== 'FAILED'));
                setRemainingAttempts(data.remaining);
            } catch (err) {
                console.error("Failed to load images", err);
            }
        }
    };

    useEffect(() => {
        fetchImages();
    }, [article.webId, article.articleId]);

    // Polling for pending images
    useEffect(() => {
        const hasPending = images.some(img => img.status === 'PENDING');
        if (!hasPending) return;

        const interval = setInterval(() => {
            fetchImages();
        }, 3000);

        return () => clearInterval(interval);
    }, [images, article.webId, article.articleId]);

    const handleNewPicture = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!article.webId || !article.articleId) {
            Swal.fire({
                text: "Missing article information to generate image.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        try {
            // Fetch image usage stats
            const imagesData = await apiFetch<{ limit: number; generated: number; remaining: number }>(`/webs/${article.webId}/articles/${article.articleId}/images`);
            const attemptsLeft = imagesData.remaining;
            setRemainingAttempts(attemptsLeft);

            if (attemptsLeft <= 0) {
                Swal.fire({
                    text: "You have reached the image generation limit for this article.",
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok",
                    customClass: {
                        confirmButton: "btn btn-primary",
                    }
                });
                return;
            }

            Swal.fire({
                title: "Generate New Picture",
                html: `You have <b>${attemptsLeft}</b> attempts left out of <b>${imagesData.limit}</b>.<br/><br/>Are you sure you want to generate a new picture?`,
                icon: "question",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "Yes, generate it!",
                cancelButtonText: "No, return",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(async function (result) {
                if (result.value) {
                    try {
                        const response = await apiFetch<{ success: boolean; image: ArticleImage }>(`/webs/${article.webId}/articles/${article.articleId}/images/generate`, {
                            method: 'POST'
                        });

                        if (response.success && response.image) {
                            setImages(prev => [...prev, response.image]);
                            // Decrement remaining attempts locally
                            setRemainingAttempts(prev => (prev !== null ? Math.max(0, prev - 1) : null));
                        }

                        Swal.fire({
                            text: "New picture generation started!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary",
                            }
                        });
                    } catch (error) {
                        console.error("Failed to generate image:", error);
                        Swal.fire({
                            text: "Failed to start image generation.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok",
                            customClass: {
                                confirmButton: "btn btn-primary",
                            }
                        });
                    }
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // Do nothing on cancel
                }
            });
        } catch (error) {
            console.error("Failed to fetch image stats:", error);
            Swal.fire({
                text: "Failed to check image generation limits.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
        }
    };
    return (
        <div className="flex-lg-row-fluid ms-lg-7 ms-xl-10">
            {/*begin::Card*/}
            <div className="card">
                <div className="card-header align-items-center py-5 gap-5">
                    {/*begin::Actions*/}
                    <div className="d-flex">
                        {/*begin::Back*/}
                        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Back">
                            <i className="ki-outline ki-arrow-left fs-1 m-0"></i>
                        </a>
                        {/*end::Back*/}
                        {/*begin::Rewrite*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Rewrite">
                            <i className="ki-outline ki-subtitle fs-2 m-0"></i>
                        </a>
                        {/*end::Rewrite*/}
                        {/*begin::New picture*/}
                        {article.articleId && (
                            <button
                                onClick={handleNewPicture}
                                className={`btn btn-sm btn-icon btn-light btn-active-light-primary me-2 ${remainingAttempts !== null && remainingAttempts <= 0 ? 'disabled opacity-50' : ''}`}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={remainingAttempts !== null && remainingAttempts <= 0 ? "Limit reached" : "New picture"}
                                disabled={remainingAttempts !== null && remainingAttempts <= 0}
                            >
                                <i className="ki-outline ki-picture fs-2 m-0"></i>
                            </button>
                        )}
                        {/*end::New picture*/}
                        {/*begin::Delete*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete">
                            <i className="ki-outline ki-trash fs-2 m-0"></i>
                        </a>
                        {/*end::Delete*/}
                        {/*begin::Copy*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Copy">
                            <i className="ki-outline ki-copy fs-2 m-0"></i>
                        </a>
                        {/*end::Copy*/}
                        {/*begin::Send*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Send">
                            <i className="ki-outline ki-send fs-2 m-0"></i>
                        </a>
                        {/*end::Send*/}
                    </div>
                    {/*end::Actions*/}
                    {/*begin::Pagination*/}
                    <div className="d-flex align-items-center">
                        {/*begin::Pages info*/}
                        <span className="fw-semibold text-muted me-2">1 - 1 of 1</span>
                        {/*end::Pages info*/}
                        {/*begin::Prev page*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Previous message">
                            <i className="ki-outline ki-left fs-2 m-0"></i>
                        </a>
                        {/*end::Prev page*/}
                        {/*begin::Next page*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Next message">
                            <i className="ki-outline ki-right fs-2 m-0"></i>
                        </a>
                        {/*end::Next page*/}
                        {/*begin::Settings menu*/}
                        <div>
                            <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                                <i className="ki-outline ki-dots-square fs-2 m-0"></i>
                            </a>
                        </div>
                        {/*end::Settings menu*/}
                    </div>
                    {/*end::Pagination*/}
                </div>
                <div className="card-body">
                    {/*begin::Title*/}
                    <div className="d-flex flex-wrap gap-2 justify-content-between mb-8">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                            {/*begin::Heading*/}
                            <h2 className="fw-semibold me-3 my-1">{article.articleTitle}</h2>
                            {/*begin::Heading*/}
                            {/*begin::Badges*/}
                            <span className="badge badge-light-primary my-1 me-2">{article.status}</span>
                            {article.clusterName && <span className="badge badge-light-danger my-1">{article.clusterName}</span>}
                            {/*end::Badges*/}
                        </div>
                        <div className="d-flex">
                            {/*begin::Sort*/}
                            <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Sort">
                                <i className="ki-outline ki-arrow-up-down fs-2 m-0"></i>
                            </a>
                            {/*end::Sort*/}
                            {/*begin::Print*/}
                            <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Print">
                                <i className="ki-outline ki-printer fs-2"></i>
                            </a>
                            {/*end::Print*/}
                        </div>
                    </div>
                    {/*end::Title*/}

                    {/*begin::Author*/}
                    <div className="d-flex align-items-center mb-9">
                        {/*begin::Avatar*/}
                        {images.map((img) => (
                            <div key={img.id} className="symbol symbol-50px me-4" data-bs-toggle="tooltip" title={img.prompt || 'Generated Image'} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(true)}>
                                <div className="symbol-label" style={{ backgroundImage: `url(${img.imageUrl || '/assets/media/svg/files/blank-image.svg'})`, position: 'relative' }}>
                                    {img.status === 'PENDING' && (
                                        <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-body bg-opacity-50 rounded">
                                            <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/*end::Avatar*/}
                        <div className="pe-5">
                            {/*begin::Author details*/}
                            <div className="d-flex align-items-center flex-wrap gap-1">
                                <a href="#" className="fw-bold text-gray-900 text-hover-primary">AI Generator</a>
                                <i className="ki-outline ki-abstract-8 fs-7 text-success mx-3"></i>
                                <span className="text-muted fw-bold">{new Date().toLocaleDateString()}</span>
                            </div>
                            {/*end::Author details*/}
                            {/*begin::Message details*/}
                            <div data-kt-inbox-message="details">
                                <span className="text-muted fw-semibold">Generated images for this article</span>
                            </div>
                            {/*end::Message details*/}
                        </div>
                    </div>
                    {/*end::Author*/}

                    {/*begin::Message accordion*/}
                    <div data-kt-inbox-message="message_wrapper">
                        {/*begin::Message header*/}
                        <div className="d-flex flex-wrap gap-2 flex-stack cursor-pointer" data-kt-inbox-message="header">
                            {/*begin::Actions*/}
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                {/*begin::Date*/}
                                <span className="fw-semibold text-muted text-end me-3">{new Date(article.plannedPublishAt).toLocaleString()}</span>
                                {/*end::Date*/}
                                <div className="d-flex">
                                    {/*begin::Star*/}
                                    <a href="#" className="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Star">
                                        <i className="ki-outline ki-star fs-2 m-0"></i>
                                    </a>
                                    {/*end::Star*/}
                                    {/*begin::Mark as important*/}
                                    <a href="#" className="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Mark as important">
                                        <i className="ki-outline ki-save-2 fs-2 m-0"></i>
                                    </a>
                                    {/*end::Mark as important*/}
                                </div>
                            </div>
                            {/*end::Actions*/}
                        </div>
                        {/*end::Message header*/}
                        {/*begin::Message content*/}
                        <div className="collapse fade show" data-kt-inbox-message="message">
                            <div className="py-5">
                                <div className="d-flex align-items-start">
                                    {/*begin::Image*/}
                                    {article.featuredImageUrl && (
                                        <div className="me-7">
                                            <img
                                                src={article.featuredImageUrl}
                                                alt={article.articleTitle}
                                                className="rounded"
                                                style={{ width: '200px', height: 'auto' }}
                                            />
                                        </div>
                                    )}
                                    {/*end::Image*/}

                                    {/*begin::Details*/}
                                    <div className="flex-grow-1">
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted fw-bold me-2">Article Funnel Stage:</span>
                                                <span className="fw-semibold text-gray-800">{article.articleFunnelStage}</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted fw-bold me-2">Article Intent:</span>
                                                <span className="fw-semibold text-gray-800">{article.articleIntent}</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted fw-bold me-2">Cluster Intent:</span>
                                                <span className="fw-semibold text-gray-800">{article.clusterIntent}</span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="d-flex flex-wrap gap-2">
                                                    <span className="text-muted fw-bold d-block mb-2">Keywords:</span>
                                                    {Array.isArray(article.articleKeywords) && article.articleKeywords.map((keyword: string, index: number) => (
                                                        <span key={index} className="badge badge-light-primary">{keyword}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*end::Details*/}
                                </div>
                                {article.articleHtml && (
                                    <div className="mt-8">
                                        <div className="fs-6 text-gray-800" dangerouslySetInnerHTML={{ __html: article.articleHtml }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/*end::Message content*/}
                    </div>
                    {/*end::Message accordion*/}
                </div>
            </div>
            {/*end::Card*/}

            {/* Image Editor Modal */}
            {article.webId && article.articleId && (
                <ImageEditorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    images={images}
                    webId={article.webId}
                    articleId={article.articleId}
                    onSave={fetchImages}
                />
            )}
        </div>
    );
};

export default InboxDetail;
