import React from 'react';

interface ProgressCardProps {
    value: string;
    label: string;
    change?: string;
    changeType?: 'success' | 'danger';
    progressLabel: string;
    progressValue: number;
    progressMax: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
    value,
    label,
    change,
    changeType,
    progressLabel,
    progressValue,
    progressMax
}) => {
    const percentage = Math.round((progressValue / progressMax) * 100);

    return (
        <div className="card card-flush h-md-50 mb-xl-10">
            <div className="card-header pt-5">
                <div className="card-title d-flex flex-column">
                    <div className="d-flex align-items-center">
                        <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">{value}</span>
                        {change && changeType && (
                            <span className={`badge badge-light-${changeType} fs-base`}>
                                <i className={`ki-outline ki-arrow-${changeType === 'success' ? 'up' : 'down'} fs-5 text-${changeType} ms-n1`}></i>
                                {change}
                            </span>
                        )}
                    </div>
                    <span className="text-gray-500 pt-1 fw-semibold fs-6">{label}</span>
                </div>
            </div>
            <div className="card-body d-flex align-items-end pt-0">
                <div className="d-flex align-items-center flex-column mt-3 w-100">
                    <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                        <span className="fw-bolder fs-6 text-gray-900">{progressLabel}</span>
                        <span className="fw-bold fs-6 text-gray-500">{percentage}%</span>
                    </div>
                    <div className="h-8px mx-3 w-100 bg-light-success rounded">
                        <div
                            className="bg-success rounded h-8px"
                            role="progressbar"
                            style={{ width: `${percentage}%` }}
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCard;
