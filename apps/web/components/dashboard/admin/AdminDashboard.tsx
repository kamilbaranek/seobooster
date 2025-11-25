
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import Swal from 'sweetalert2';

interface CostSummary {
    totalCost: number;
    costsByWeb: Array<{
        webId: string;
        webUrl: string;
        webNickname: string;
        totalCost: number;
        currency: string;
        inputTokens: number;
        outputTokens: number;
    }>;
}

interface ArticleCost {
    articleId: string;
    title: string;
    webUrl: string;
    webNickname: string;
    totalCost: number;
    currency: string;
    textVersions: number;
    imageVersions: number;
}

interface ArticleCostsResponse {
    data: ArticleCost[];
    total: number;
    page: number;
    limit: number;
}

const AdminDashboard = () => {
    const [summary, setSummary] = useState<CostSummary | null>(null);
    const [articles, setArticles] = useState<ArticleCostsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, articlesRes] = await Promise.all([
                apiFetch<CostSummary>('/admin/stats/costs'),
                apiFetch<ArticleCostsResponse>('/admin/stats/articles')
            ]);
            setSummary(summaryRes);
            setArticles(articlesRes);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            Swal.fire('Error', 'Failed to load admin statistics', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div id="kt_app_content" className="app-content flex-column-fluid">
            <div id="kt_app_content_container" className="app-container container-fluid">
                {/* Summary Cards */}
                <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
                    <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
                        <div className="card card-flush h-md-50 mb-5 mb-xl-10">
                            <div className="card-header pt-5">
                                <div className="card-title d-flex flex-column">
                                    <div className="d-flex align-items-center">
                                        <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">
                                            ${summary?.totalCost.toFixed(4)}
                                        </span>
                                        <span className="badge badge-light-success fs-base">
                                            <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i> 2.2%
                                        </span>
                                    </div>
                                    <span className="text-gray-500 pt-1 fw-semibold fs-6">Total AI Cost</span>
                                </div>
                            </div>
                            <div className="card-body pt-2 pb-4 d-flex flex-wrap align-items-center">
                                <div className="d-flex flex-center me-5 pt-2">
                                    <div id="kt_card_widget_17_chart" style={{ minWidth: '70px', minHeight: '70px' }} data-kt-size="70" data-kt-line="11"></div>
                                </div>
                                <div className="d-flex flex-column content-justify-center flex-row-fluid">
                                    <div className="d-flex fw-semibold align-items-center">
                                        <div className="bullet w-8px h-3px rounded-2 bg-success me-3"></div>
                                        <div className="text-gray-500 flex-grow-1 me-4">Websites</div>
                                        <div className="fw-bolder text-gray-700 text-xxl-end">{summary?.costsByWeb.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Website Costs Table */}
                <div className="card card-flush mb-5 mb-xl-10">
                    <div className="card-header pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold text-gray-900">Website Costs</span>
                            <span className="text-gray-500 mt-1 fw-semibold fs-6">Aggregated costs per website</span>
                        </h3>
                    </div>
                    <div className="card-body pt-0">
                        <div className="table-responsive">
                            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                <thead>
                                    <tr className="fw-bold text-muted">
                                        <th className="min-w-150px">Website</th>
                                        <th className="min-w-140px">Input Tokens</th>
                                        <th className="min-w-120px">Output Tokens</th>
                                        <th className="min-w-100px text-end">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary?.costsByWeb.map((web) => (
                                        <tr key={web.webId}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="d-flex justify-content-start flex-column">
                                                        <a href="#" className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6">{web.webNickname || web.webUrl}</a>
                                                        <span className="text-muted fw-semibold text-muted d-block fs-7">{web.webUrl}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-gray-900 fw-bold d-block fs-6">{web.inputTokens.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <span className="text-gray-900 fw-bold d-block fs-6">{web.outputTokens.toLocaleString()}</span>
                                            </td>
                                            <td className="text-end">
                                                <span className="badge badge-light-danger fs-base">${web.totalCost.toFixed(4)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Article Costs Table */}
                <div className="card card-flush">
                    <div className="card-header pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold text-gray-900">Article Costs</span>
                            <span className="text-gray-500 mt-1 fw-semibold fs-6">Detailed cost breakdown per article</span>
                        </h3>
                    </div>
                    <div className="card-body pt-0">
                        <div className="table-responsive">
                            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                <thead>
                                    <tr className="fw-bold text-muted">
                                        <th className="min-w-200px">Article</th>
                                        <th className="min-w-150px">Website</th>
                                        <th className="min-w-100px">Versions</th>
                                        <th className="min-w-100px text-end">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles?.data.map((article) => (
                                        <tr key={article.articleId}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="d-flex justify-content-start flex-column">
                                                        <a href="#" className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6">{article.title}</a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-gray-900 fw-bold d-block fs-6">{article.webNickname || article.webUrl}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="text-gray-900 fw-bold fs-6">Text: {article.textVersions}</span>
                                                    <span className="text-muted fw-semibold fs-7">Images: {article.imageVersions}</span>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <span className="badge badge-light-danger fs-base">${article.totalCost.toFixed(4)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
