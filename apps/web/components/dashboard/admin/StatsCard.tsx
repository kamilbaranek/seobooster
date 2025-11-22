import React from 'react';

interface StatsCardProps {
    value: string;
    currency?: string;
    label: string;
    change: string;
    changeType: 'success' | 'danger';
    chartId: string;
    chartHeight?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    value,
    currency,
    label,
    change,
    changeType,
    chartId,
    chartHeight = '125px'
}) => {
    return (
        <div className="card overflow-hidden h-md-50 mb-5 mb-xl-10">
            <div className="card-body d-flex justify-content-between flex-column px-0 pb-0">
                {/* Statistics */}
                <div className="mb-4 px-9">
                    <div className="d-flex align-items-center mb-2">
                        {currency && (
                            <span className="fs-4 fw-semibold text-gray-500 align-self-start me-1">{currency}</span>
                        )}
                        <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1">{value}</span>
                        <span className={`badge badge-light-${changeType} fs-base`}>
                            <i className={`ki-outline ki-arrow-${changeType === 'success' ? 'up' : 'down'} fs-5 text-${changeType} ms-n1`}></i>
                            {change}
                        </span>
                    </div>
                    <span className="fs-6 fw-semibold text-gray-500">{label}</span>
                </div>
                {/* Chart */}
                <div id={chartId} className="min-h-auto" style={{ height: chartHeight }}></div>
            </div>
        </div>
    );
};

export default StatsCard;
