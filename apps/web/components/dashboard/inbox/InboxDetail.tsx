import React from 'react';

interface ArticlePlan {
    id: string;
    status: string;
    plannedPublishAt: string;
    articleTitle: string;
    articleKeywords: any;
    articleIntent: string;
    articleFunnelStage: string;
    clusterName: string;
    clusterIntent: string;
    featuredImageUrl?: string | null;
    articleHtml?: string | null;
    articleMarkdown?: string | null;
}

interface InboxDetailProps {
    article: ArticlePlan;
    onBack: () => void;
}

const InboxDetail: React.FC<InboxDetailProps> = ({ article, onBack }) => {
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
                        {/*begin::Archive*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Archive">
                            <i className="ki-outline ki-sms fs-2 m-0"></i>
                        </a>
                        {/*end::Archive*/}
                        {/*begin::Spam*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Spam">
                            <i className="ki-outline ki-information fs-2 m-0"></i>
                        </a>
                        {/*end::Spam*/}
                        {/*begin::Delete*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete">
                            <i className="ki-outline ki-trash fs-2 m-0"></i>
                        </a>
                        {/*end::Delete*/}
                        {/*begin::Mark as read*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Mark as read">
                            <i className="ki-outline ki-copy fs-2 m-0"></i>
                        </a>
                        {/*end::Mark as read*/}
                        {/*begin::Move*/}
                        <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Move">
                            <i className="ki-outline ki-entrance-left fs-2 m-0"></i>
                        </a>
                        {/*end::Move*/}
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
        </div>
    );
};

export default InboxDetail;
