import React from 'react';

interface UserAvatarProps {
    name: string;
    image?: string;
    color?: 'warning' | 'primary' | 'danger' | 'success' | 'info';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, image, color = 'primary' }) => {
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title={name}>
            {image ? (
                <img alt="Pic" src={image} />
            ) : (
                <span className={`symbol-label bg-${color} text-inverse-${color} fw-bold`}>{initial}</span>
            )}
        </div>
    );
};

interface AvatarCardProps {
    value: string;
    label: string;
    heroesLabel: string;
    users: Array<{ name: string; image?: string; color?: 'warning' | 'primary' | 'danger' | 'success' | 'info' }>;
    moreCount?: number;
}

const AvatarCard: React.FC<AvatarCardProps> = ({
    value,
    label,
    heroesLabel,
    users,
    moreCount
}) => {
    return (
        <div className="card card-flush h-md-50 mb-xl-10">
            <div className="card-header pt-5">
                <div className="card-title d-flex flex-column">
                    <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">{value}</span>
                    <span className="text-gray-500 pt-1 fw-semibold fs-6">{label}</span>
                </div>
            </div>
            <div className="card-body d-flex flex-column justify-content-end pe-0">
                <span className="fs-6 fw-bolder text-gray-800 d-block mb-2">{heroesLabel}</span>
                <div className="symbol-group symbol-hover flex-nowrap">
                    {users.map((user, index) => (
                        <UserAvatar key={index} {...user} />
                    ))}
                    {moreCount && moreCount > 0 && (
                        <a href="#" className="symbol symbol-35px symbol-circle">
                            <span className="symbol-label bg-light text-gray-400 fs-8 fw-bold">+{moreCount}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvatarCard;
