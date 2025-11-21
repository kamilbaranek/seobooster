import React from 'react';
import InboxDetail from './InboxDetail';

export interface ArticlePlan {
    id: string;
    webId: string;
    articleId?: string | null;
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

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'PLANNED': return 'badge-light-info';
        case 'QUEUED': return 'badge-light-warning';
        case 'GENERATED': return 'badge-light-success';
        case 'PUBLISHED': return 'badge-light-primary';
        case 'SKIPPED': return 'badge-light-danger';
        default: return 'badge-light-secondary';
    }
};

const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface InboxTabProps {
    plans?: ArticlePlan[];
}

const InboxTab: React.FC<InboxTabProps> = ({ plans = [] }) => {
    const [selectedArticle, setSelectedArticle] = React.useState<ArticlePlan | null>(null);

    return (
        <div className="d-flex flex-column flex-lg-row">
            {/*begin::Sidebar*/}
            <div className="d-none d-lg-flex flex-column flex-lg-row-auto w-100 w-lg-275px" data-kt-drawer="true" data-kt-drawer-name="inbox-aside" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="225px" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_inbox_aside_toggle">
                {/*begin::Sticky aside*/}
                <div className="card card-flush mb-0" data-kt-sticky="false" data-kt-sticky-name="inbox-aside-sticky" data-kt-sticky-offset="{default: false, xl: '100px'}" data-kt-sticky-width="{lg: '275px'}" data-kt-sticky-left="auto" data-kt-sticky-top="100px" data-kt-sticky-animation="false" data-kt-sticky-zindex="95">
                    {/*begin::Aside content*/}
                    <div className="card-body">
                        {/*begin::Button*/}
                        <a href="#" className="btn btn-primary fw-bold w-100 mb-8">New Message</a>
                        {/*end::Button*/}
                        {/*begin::Menu*/}
                        <div className="menu menu-column menu-rounded menu-state-bg menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary mb-10">
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Inbox*/}
                                <span className={`menu-link ${!selectedArticle ? 'active' : ''}`} onClick={() => setSelectedArticle(null)}>
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-sms fs-2 me-3"></i>
                                    </span>
                                    <span className="menu-title fw-bold">Inbox</span>
                                    <span className="badge badge-light-success">{plans.length}</span>
                                </span>
                                {/*end::Inbox*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Marked*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-abstract-23 fs-2 me-3"></i>
                                    </span>
                                    <span className="menu-title fw-bold">Marked</span>
                                </span>
                                {/*end::Marked*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Draft*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-file fs-2 me-3"></i>
                                    </span>
                                    <span className="menu-title fw-bold">Draft</span>
                                    <span className="badge badge-light-warning">5</span>
                                </span>
                                {/*end::Draft*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Sent*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-send fs-2 me-3"></i>
                                    </span>
                                    <span className="menu-title fw-bold">Sent</span>
                                </span>
                                {/*end::Sent*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item">
                                {/*begin::Trash*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-trash fs-2 me-3"></i>
                                    </span>
                                    <span className="menu-title fw-bold">Trash</span>
                                </span>
                                {/*end::Trash*/}
                            </div>
                            {/*end::Menu item*/}
                        </div>
                        {/*end::Menu*/}
                        {/*begin::Menu*/}
                        <div className="menu menu-column menu-rounded menu-state-bg menu-state-title-primary">
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Custom work*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-abstract-8 fs-5 text-danger me-3 lh-0"></i>
                                    </span>
                                    <span className="menu-title fw-semibold">Custom Work</span>
                                    <span className="badge badge-light-danger">6</span>
                                </span>
                                {/*end::Custom work*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::Partnership*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-abstract-8 fs-5 text-success me-3 lh-0"></i>
                                    </span>
                                    <span className="menu-title fw-semibold">Partnership</span>
                                </span>
                                {/*end::Partnership*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item mb-3">
                                {/*begin::In progress*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-abstract-8 fs-5 text-info me-3 lh-0"></i>
                                    </span>
                                    <span className="menu-title fw-semibold">In Progress</span>
                                </span>
                                {/*end::In progress*/}
                            </div>
                            {/*end::Menu item*/}
                            {/*begin::Menu item*/}
                            <div className="menu-item">
                                {/*begin::Add label*/}
                                <span className="menu-link">
                                    <span className="menu-icon">
                                        <i className="ki-outline ki-plus fs-2 me-3 lh-0"></i>
                                    </span>
                                    <span className="menu-title fw-semibold">Add Label</span>
                                </span>
                                {/*end::Add label*/}
                            </div>
                            {/*end::Menu item*/}
                        </div>
                        {/*end::Menu*/}
                    </div>
                    {/*end::Aside content*/}
                </div>
                {/*end::Sticky aside*/}
            </div>
            {/*end::Sidebar*/}
            {/*begin::Content*/}
            {selectedArticle ? (
                <InboxDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
            ) : (
                <div className="flex-lg-row-fluid ms-lg-7 ms-xl-10">
                    {/*begin::Card*/}
                    <div className="card">
                        <div className="card-header align-items-center py-5 gap-2 gap-md-5">
                            {/*begin::Actions*/}
                            <div className="d-flex flex-wrap gap-2">
                                {/*begin::Checkbox*/}
                                <div className="form-check form-check-sm form-check-custom form-check-solid me-4 me-lg-7">
                                    <input className="form-check-input" type="checkbox" data-kt-check="true" data-kt-check-target="#kt_inbox_listing .form-check-input" value="1" />
                                </div>
                                {/*end::Checkbox*/}
                                {/*begin::Reload*/}
                                <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-dismiss="click" data-bs-placement="top" title="Reload">
                                    <i className="ki-outline ki-arrows-circle fs-2"></i>
                                </a>
                                {/*end::Reload*/}
                                {/*begin::Archive*/}
                                <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-dismiss="click" data-bs-placement="top" title="Archive">
                                    <i className="ki-outline ki-sms fs-2"></i>
                                </a>
                                {/*end::Archive*/}
                                {/*begin::Delete*/}
                                <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-dismiss="click" data-bs-placement="top" title="Delete">
                                    <i className="ki-outline ki-trash fs-2"></i>
                                </a>
                                {/*end::Delete*/}
                                {/*begin::Filter*/}
                                <div>
                                    <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start">
                                        <i className="ki-outline ki-down fs-2"></i>
                                    </a>
                                    {/*begin::Menu*/}
                                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="show_all">All</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="show_read">Read</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="show_unread">Unread</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="show_starred">Starred</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="show_unstarred">Unstarred</a>
                                        </div>
                                        {/*end::Menu item*/}
                                    </div>
                                    {/*end::Menu*/}
                                </div>
                                {/*end::Filter*/}
                                {/*begin::Sort*/}
                                <span>
                                    <a href="#" className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-dismiss="click" data-bs-placement="top" title="Sort">
                                        <i className="ki-outline ki-dots-square fs-3 m-0"></i>
                                    </a>
                                    {/*begin::Menu*/}
                                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="filter_newest">Newest</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="filter_oldest">Oldest</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3" data-kt-inbox-listing-filter="filter_unread">Unread</a>
                                        </div>
                                        {/*end::Menu item*/}
                                    </div>
                                    {/*end::Menu*/}
                                </span>
                                {/*end::Sort*/}
                            </div>
                            {/*end::Actions*/}
                            {/*begin::Actions*/}
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                {/*begin::Search*/}
                                <div className="d-flex align-items-center position-relative">
                                    <i className="ki-outline ki-magnifier fs-3 position-absolute ms-4"></i>
                                    <input type="text" data-kt-inbox-listing-filter="search" className="form-control form-control-sm form-control-solid mw-100 min-w-125px min-w-lg-150px min-w-xxl-200px ps-11" placeholder="Search inbox" />
                                </div>
                                {/*end::Search*/}
                                {/*begin::Toggle*/}
                                <a href="#" className="btn btn-sm btn-icon btn-color-primary btn-light btn-active-light-primary d-lg-none" data-bs-toggle="tooltip" data-bs-dismiss="click" data-bs-placement="top" title="Toggle inbox menu" id="kt_inbox_aside_toggle">
                                    <i className="ki-outline ki-burger-menu-2 fs-3 m-0"></i>
                                </a>
                                {/*end::Toggle*/}
                            </div>
                            {/*end::Actions*/}
                        </div>
                        <div className="card-body p-0">
                            {/*begin::Table*/}
                            <table className="table table-hover table-row-dashed fs-6 gy-5 my-0" id="kt_inbox_listing">
                                <thead className="d-none">
                                    <tr>
                                        <th>Checkbox</th>
                                        <th>Actions</th>
                                        <th>Author</th>
                                        <th>Title</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-10">
                                                No article plans found
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan) => (
                                            <tr key={plan.id}>
                                                <td className="ps-9">
                                                    <div className="form-check form-check-sm form-check-custom form-check-solid mt-3">
                                                        <input className="form-check-input" type="checkbox" value="1" />
                                                    </div>
                                                </td>
                                                <td className="min-w-80px">
                                                    {/*begin::Star*/}
                                                    <a href="#" className="btn btn-icon btn-color-gray-500 btn-active-color-primary w-35px h-35px" data-bs-toggle="tooltip" data-bs-placement="right" title="Star">
                                                        <i className="ki-outline ki-star fs-3"></i>
                                                    </a>
                                                    {/*end::Star*/}
                                                    {/*begin::Important*/}
                                                    <a href="#" className="btn btn-icon btn-color-gray-500 btn-active-color-primary w-35px h-35px" data-bs-toggle="tooltip" data-bs-placement="right" title="Mark as important">
                                                        <i className="ki-outline ki-save-2 fs-4 mt-1"></i>
                                                    </a>
                                                    {/*end::Important*/}
                                                </td>
                                                <td className="w-150px w-md-175px">
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setSelectedArticle(plan); }} className="d-flex align-items-center text-gray-900">
                                                        {/*begin::Avatar*/}
                                                        <div className="symbol symbol-35px me-3">
                                                            {plan.featuredImageUrl ? (
                                                                <span className="symbol-label" style={{ backgroundImage: `url(${plan.featuredImageUrl})` }}></span>
                                                            ) : (
                                                                <div className="symbol-label bg-light-danger">
                                                                    <span className="text-danger">{plan.articleTitle.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/*end::Avatar*/}
                                                        {/*begin::Name*/}
                                                        <span className="fw-semibold">{plan.articleFunnelStage || 'No Stage'}</span>
                                                        {/*end::Name*/}
                                                    </a>
                                                </td>
                                                <td>
                                                    <div className="text-gray-900 gap-1 pt-2">
                                                        {/*begin::Heading*/}
                                                        <a href="#" onClick={(e) => { e.preventDefault(); setSelectedArticle(plan); }} className="text-gray-900">
                                                            <span className="fw-bold">{plan.articleTitle}</span>
                                                        </a>
                                                        {/*end::Heading*/}
                                                    </div>
                                                    {/*begin::Badges*/}
                                                    {plan.clusterName && (
                                                        <div className="badge badge-light me-1">Pillar: {plan.clusterName}</div>
                                                    )}
                                                    {Array.isArray(plan.articleKeywords) && plan.articleKeywords.map((keyword: string, index: number) => (
                                                        <div key={index} className="badge badge-light-primary me-1">{keyword}</div>
                                                    ))}
                                                    {/*end::Badges*/}
                                                </td>
                                                <td className="w-100px text-end fs-7 pe-9">
                                                    <div className="fw-semibold">{new Date(plan.plannedPublishAt).toLocaleDateString()}</div>
                                                    <div className="text-muted fs-8">{new Date(plan.plannedPublishAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="mt-1">
                                                        <span className={`badge ${getStatusBadgeClass(plan.status)}`}>{formatStatus(plan.status)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {/*end::Table*/}
                        </div>
                    </div>
                    {/*end::Card*/}
                </div>
            )}
            {/*end::Content*/}
        </div>
    );
};

export default InboxTab;
