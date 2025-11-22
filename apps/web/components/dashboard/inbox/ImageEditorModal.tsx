import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api-client';

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

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: ArticleImage[];
    webId: string;
    articleId: string;
    onSave: () => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
    isOpen,
    onClose,
    images,
    webId,
    articleId,
    onSave
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [imageData, setImageData] = useState<Record<string, { altText: string; fileName: string; isFeatured: boolean }>>({});

    useEffect(() => {
        if (isOpen) {
            // Initialize image data from props
            const initialData: Record<string, { altText: string; fileName: string; isFeatured: boolean }> = {};
            images.forEach((img) => {
                initialData[img.id] = {
                    altText: img.altText || '',
                    fileName: img.fileName || '',
                    isFeatured: img.isFeatured
                };
            });
            setImageData(initialData);
            setCurrentStep(0);
        }
    }, [isOpen, images]);

    if (!isOpen) return null;

    const handleInputChange = (imageId: string, field: 'altText' | 'fileName' | 'isFeatured', value: string | boolean) => {
        setImageData(prev => ({
            ...prev,
            [imageId]: {
                ...prev[imageId],
                [field]: value
            }
        }));
    };

    const handleNext = () => {
        if (currentStep < images.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            // Update all images
            await Promise.all(
                images.map(async (img) => {
                    const data = imageData[img.id];
                    if (data) {
                        await apiFetch(`/webs/${webId}/articles/${articleId}/images/${img.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify(data)
                        });
                    }
                })
            );
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to update images:', error);
            alert('Failed to update images. Please try again.');
        }
    };

    const currentImage = images[currentStep];
    const currentData = currentImage ? imageData[currentImage.id] : null;

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-fullscreen p-9">
                <div className="modal-content modal-rounded">
                    <div className="modal-header py-7 d-flex justify-content-between">
                        <h2>Edit Article Images</h2>
                        <div className="btn btn-sm btn-icon btn-active-color-primary" onClick={onClose}>
                            <i className="ki-outline ki-cross fs-1"></i>
                        </div>
                    </div>
                    <div className="modal-body scroll-y m-5">
                        <div className="stepper stepper-links d-flex flex-column">
                            {/* Stepper Nav */}
                            <div className="stepper-nav justify-content-center py-2">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className={`stepper-item me-5 me-md-15 ${index === currentStep ? 'current' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setCurrentStep(index)}
                                    >
                                        <h3 className="stepper-title">Image {index + 1}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Form */}
                            <form className="mx-auto w-100 mw-600px pt-15 pb-10" onSubmit={(e) => e.preventDefault()}>
                                {currentImage && currentData && (
                                    <div className="current">
                                        <div className="w-100">
                                            {/* Image Preview */}
                                            {currentImage.imageUrl && (
                                                <div className="pb-10 text-center">
                                                    <img
                                                        src={currentImage.imageUrl}
                                                        alt={currentData.altText || `Image ${currentStep + 1}`}
                                                        className="mw-100 rounded"
                                                        style={{ maxHeight: '300px' }}
                                                    />
                                                </div>
                                            )}

                                            {/* File Name */}
                                            <div className="mb-10 fv-row">
                                                <label className="form-label mb-3">Image Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg form-control-solid"
                                                    placeholder="Enter image name"
                                                    value={currentData.fileName}
                                                    onChange={(e) => handleInputChange(currentImage.id, 'fileName', e.target.value)}
                                                />
                                            </div>

                                            {/* Alt Text */}
                                            <div className="mb-10 fv-row">
                                                <label className="form-label mb-3">Alt Text</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg form-control-solid"
                                                    placeholder="Enter alt text for accessibility"
                                                    value={currentData.altText}
                                                    onChange={(e) => handleInputChange(currentImage.id, 'altText', e.target.value)}
                                                />
                                            </div>

                                            {/* Featured */}
                                            <div className="mb-10">
                                                <label className="form-check form-switch form-check-custom form-check-solid">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={currentData.isFeatured}
                                                        onChange={(e) => handleInputChange(currentImage.id, 'isFeatured', e.target.checked)}
                                                        disabled={currentImage.status !== 'SUCCESS'}
                                                    />
                                                    <span className="form-check-label fw-semibold text-muted">
                                                        Set as Featured Image
                                                    </span>
                                                </label>
                                                {currentImage.status !== 'SUCCESS' && (
                                                    <div className="form-text text-warning">
                                                        Only successfully generated images can be set as featured
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="d-flex flex-stack pt-10">
                                    <div className="me-2">
                                        <button
                                            type="button"
                                            className="btn btn-lg btn-light-primary me-3"
                                            onClick={handlePrevious}
                                            disabled={currentStep === 0}
                                        >
                                            <i className="ki-outline ki-arrow-left fs-3 me-1"></i>Back
                                        </button>
                                    </div>
                                    <div>
                                        {currentStep < images.length - 1 ? (
                                            <button
                                                type="button"
                                                className="btn btn-lg btn-primary"
                                                onClick={handleNext}
                                            >
                                                Next<i className="ki-outline ki-arrow-right fs-3 ms-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-lg btn-primary"
                                                onClick={handleSubmit}
                                            >
                                                Save Changes<i className="ki-outline ki-check fs-3 ms-2"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
