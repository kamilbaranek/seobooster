import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { countryOptions } from '../../../lib/countryOptions';
import { apiFetch } from '../../../lib/api-client';
import { getToken } from '../../../lib/auth-storage';

interface SettingsTabProps {
    project: any;
    onUpdate: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ project, onUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [projectName, setProjectName] = useState(project?.nickname || '');
    const [businessDescription, setBusinessDescription] = useState(project?.seoStrategies?.[0]?.businessDescription || '');
    const [businessAudience, setBusinessAudience] = useState(project?.seoStrategies?.[0]?.businessTargetAudience || '');
    const [publicationSchedule, setPublicationSchedule] = useState<string[]>(
        (project?.publicationSchedule && project.publicationSchedule.length > 0)
            ? project.publicationSchedule
            : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    );
    const [timezone, setTimezone] = useState(project?.timezone || 'UTC');
    const [language, setLanguage] = useState(project?.language || 'en');
    const [country, setCountry] = useState(project?.country || '');

    // Sync state with project prop changes
    useEffect(() => {
        if (project) {
            setProjectName(project.nickname || '');
            setBusinessDescription(project.seoStrategies?.[0]?.businessDescription || '');
            setBusinessAudience(project.seoStrategies?.[0]?.businessTargetAudience || '');
            setPublicationSchedule(
                (project.publicationSchedule && project.publicationSchedule.length > 0)
                    ? project.publicationSchedule
                    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            );
            setTimezone(project.timezone || 'UTC');
            setLanguage(project.language || 'en');
            setCountry(project.country || '');
        }
    }, [project]);

    // WordPress credentials state
    const [wpUsername, setWpUsername] = useState('');
    const [wpPassword, setWpPassword] = useState('');
    const [wpAutoPublishMode, setWpAutoPublishMode] = useState<'draft_only' | 'manual_approval' | 'auto_publish'>('draft_only');
    const [wpApprovalEmail, setWpApprovalEmail] = useState('');
    const [hasCredentials, setHasCredentials] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // GitHub credentials state
    const [githubUsername, setGithubUsername] = useState('');
    const [hasGithub, setHasGithub] = useState(false);
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<{ value: string, label: string } | null>(null);
    const [githubFolder, setGithubFolder] = useState('articles');
    const [githubBranch, setGithubBranch] = useState('main');
    const [loadingRepos, setLoadingRepos] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const timezoneOptions = [
        { value: 'International Date Line West', label: '(GMT-11:00) International Date Line West' },
        { value: 'Midway Island', label: '(GMT-11:00) Midway Island' },
        { value: 'Samoa', label: '(GMT-11:00) Samoa' },
        { value: 'Hawaii', label: '(GMT-10:00) Hawaii' },
        { value: 'Alaska', label: '(GMT-08:00) Alaska' },
        { value: 'Pacific Time (US & Canada)', label: '(GMT-07:00) Pacific Time (US & Canada)' },
        { value: 'Tijuana', label: '(GMT-07:00) Tijuana' },
        { value: 'Arizona', label: '(GMT-07:00) Arizona' },
        { value: 'Mountain Time (US & Canada)', label: '(GMT-06:00) Mountain Time (US & Canada)' },
        { value: 'Chihuahua', label: '(GMT-06:00) Chihuahua' },
        { value: 'Mazatlan', label: '(GMT-06:00) Mazatlan' },
        { value: 'Saskatchewan', label: '(GMT-06:00) Saskatchewan' },
        { value: 'Central America', label: '(GMT-06:00) Central America' },
        { value: 'Central Time (US & Canada)', label: '(GMT-05:00) Central Time (US & Canada)' },
        { value: 'Guadalajara', label: '(GMT-05:00) Guadalajara' },
        { value: 'Mexico City', label: '(GMT-05:00) Mexico City' },
        { value: 'Monterrey', label: '(GMT-05:00) Monterrey' },
        { value: 'Bogota', label: '(GMT-05:00) Bogota' },
        { value: 'Lima', label: '(GMT-05:00) Lima' },
        { value: 'Quito', label: '(GMT-05:00) Quito' },
        { value: 'Eastern Time (US & Canada)', label: '(GMT-04:00) Eastern Time (US & Canada)' },
        { value: 'Indiana (East)', label: '(GMT-04:00) Indiana (East)' },
        { value: 'Caracas', label: '(GMT-04:00) Caracas' },
        { value: 'La Paz', label: '(GMT-04:00) La Paz' },
        { value: 'Georgetown', label: '(GMT-04:00) Georgetown' },
        { value: 'Atlantic Time (Canada)', label: '(GMT-03:00) Atlantic Time (Canada)' },
        { value: 'Santiago', label: '(GMT-03:00) Santiago' },
        { value: 'Brasilia', label: '(GMT-03:00) Brasilia' },
        { value: 'Buenos Aires', label: '(GMT-03:00) Buenos Aires' },
        { value: 'Newfoundland', label: '(GMT-02:30) Newfoundland' },
        { value: 'Greenland', label: '(GMT-02:00) Greenland' },
        { value: 'Mid-Atlantic', label: '(GMT-02:00) Mid-Atlantic' },
        { value: 'Cape Verde Is.', label: '(GMT-01:00) Cape Verde Is.' },
        { value: 'Azores', label: '(GMT) Azores' },
        { value: 'Monrovia', label: '(GMT) Monrovia' },
        { value: 'UTC', label: '(GMT) UTC' },
        { value: 'Dublin', label: '(GMT+01:00) Dublin' },
        { value: 'Edinburgh', label: '(GMT+01:00) Edinburgh' },
        { value: 'Lisbon', label: '(GMT+01:00) Lisbon' },
        { value: 'London', label: '(GMT+01:00) London' },
        { value: 'Casablanca', label: '(GMT+01:00) Casablanca' },
        { value: 'West Central Africa', label: '(GMT+01:00) West Central Africa' },
        { value: 'Belgrade', label: '(GMT+02:00) Belgrade' },
        { value: 'Bratislava', label: '(GMT+02:00) Bratislava' },
        { value: 'Budapest', label: '(GMT+02:00) Budapest' },
        { value: 'Ljubljana', label: '(GMT+02:00) Ljubljana' },
        { value: 'Prague', label: '(GMT+02:00) Prague' },
        { value: 'Sarajevo', label: '(GMT+02:00) Sarajevo' },
        { value: 'Skopje', label: '(GMT+02:00) Skopje' },
        { value: 'Warsaw', label: '(GMT+02:00) Warsaw' },
        { value: 'Zagreb', label: '(GMT+02:00) Zagreb' },
        { value: 'Brussels', label: '(GMT+02:00) Brussels' },
        { value: 'Copenhagen', label: '(GMT+02:00) Copenhagen' },
        { value: 'Madrid', label: '(GMT+02:00) Madrid' },
        { value: 'Paris', label: '(GMT+02:00) Paris' },
        { value: 'Amsterdam', label: '(GMT+02:00) Amsterdam' },
        { value: 'Berlin', label: '(GMT+02:00) Berlin' },
        { value: 'Bern', label: '(GMT+02:00) Bern' },
        { value: 'Rome', label: '(GMT+02:00) Rome' },
        { value: 'Stockholm', label: '(GMT+02:00) Stockholm' },
        { value: 'Vienna', label: '(GMT+02:00) Vienna' },
        { value: 'Cairo', label: '(GMT+02:00) Cairo' },
        { value: 'Harare', label: '(GMT+02:00) Harare' },
        { value: 'Pretoria', label: '(GMT+02:00) Pretoria' },
        { value: 'Bucharest', label: '(GMT+03:00) Bucharest' },
        { value: 'Helsinki', label: '(GMT+03:00) Helsinki' },
        { value: 'Kiev', label: '(GMT+03:00) Kiev' },
        { value: 'Kyiv', label: '(GMT+03:00) Kyiv' },
        { value: 'Riga', label: '(GMT+03:00) Riga' },
        { value: 'Sofia', label: '(GMT+03:00) Sofia' },
        { value: 'Tallinn', label: '(GMT+03:00) Tallinn' },
        { value: 'Vilnius', label: '(GMT+03:00) Vilnius' },
        { value: 'Athens', label: '(GMT+03:00) Athens' },
        { value: 'Istanbul', label: '(GMT+03:00) Istanbul' },
        { value: 'Minsk', label: '(GMT+03:00) Minsk' },
        { value: 'Jerusalem', label: '(GMT+03:00) Jerusalem' },
        { value: 'Moscow', label: '(GMT+03:00) Moscow' },
        { value: 'St. Petersburg', label: '(GMT+03:00) St. Petersburg' },
        { value: 'Volgograd', label: '(GMT+03:00) Volgograd' },
        { value: 'Kuwait', label: '(GMT+03:00) Kuwait' },
        { value: 'Riyadh', label: '(GMT+03:00) Riyadh' },
        { value: 'Nairobi', label: '(GMT+03:00) Nairobi' },
        { value: 'Baghdad', label: '(GMT+03:00) Baghdad' },
        { value: 'Abu Dhabi', label: '(GMT+04:00) Abu Dhabi' },
        { value: 'Muscat', label: '(GMT+04:00) Muscat' },
        { value: 'Baku', label: '(GMT+04:00) Baku' },
        { value: 'Tbilisi', label: '(GMT+04:00) Tbilisi' },
        { value: 'Yerevan', label: '(GMT+04:00) Yerevan' },
        { value: 'Tehran', label: '(GMT+04:30) Tehran' },
        { value: 'Kabul', label: '(GMT+04:30) Kabul' },
        { value: 'Ekaterinburg', label: '(GMT+05:00) Ekaterinburg' },
        { value: 'Islamabad', label: '(GMT+05:00) Islamabad' },
        { value: 'Karachi', label: '(GMT+05:00) Karachi' },
        { value: 'Tashkent', label: '(GMT+05:00) Tashkent' },
        { value: 'Chennai', label: '(GMT+05:30) Chennai' },
        { value: 'Kolkata', label: '(GMT+05:30) Kolkata' },
        { value: 'Mumbai', label: '(GMT+05:30) Mumbai' },
        { value: 'New Delhi', label: '(GMT+05:30) New Delhi' },
        { value: 'Sri Jayawardenepura', label: '(GMT+05:30) Sri Jayawardenepura' },
        { value: 'Kathmandu', label: '(GMT+05:45) Kathmandu' },
        { value: 'Astana', label: '(GMT+06:00) Astana' },
        { value: 'Dhaka', label: '(GMT+06:00) Dhaka' },
        { value: 'Almaty', label: '(GMT+06:00) Almaty' },
        { value: 'Urumqi', label: '(GMT+06:00) Urumqi' },
        { value: 'Rangoon', label: '(GMT+06:30) Rangoon' },
        { value: 'Novosibirsk', label: '(GMT+07:00) Novosibirsk' },
        { value: 'Bangkok', label: '(GMT+07:00) Bangkok' },
        { value: 'Hanoi', label: '(GMT+07:00) Hanoi' },
        { value: 'Jakarta', label: '(GMT+07:00) Jakarta' },
        { value: 'Krasnoyarsk', label: '(GMT+07:00) Krasnoyarsk' },
        { value: 'Beijing', label: '(GMT+08:00) Beijing' },
        { value: 'Chongqing', label: '(GMT+08:00) Chongqing' },
        { value: 'Hong Kong', label: '(GMT+08:00) Hong Kong' },
        { value: 'Kuala Lumpur', label: '(GMT+08:00) Kuala Lumpur' },
        { value: 'Singapore', label: '(GMT+08:00) Singapore' },
        { value: 'Taipei', label: '(GMT+08:00) Taipei' },
        { value: 'Perth', label: '(GMT+08:00) Perth' },
        { value: 'Irkutsk', label: '(GMT+08:00) Irkutsk' },
        { value: 'Ulaan Bataar', label: '(GMT+08:00) Ulaan Bataar' },
        { value: 'Seoul', label: '(GMT+09:00) Seoul' },
        { value: 'Osaka', label: '(GMT+09:00) Osaka' },
        { value: 'Sapporo', label: '(GMT+09:00) Sapporo' },
        { value: 'Tokyo', label: '(GMT+09:00) Tokyo' },
        { value: 'Yakutsk', label: '(GMT+09:00) Yakutsk' },
        { value: 'Darwin', label: '(GMT+09:30) Darwin' },
        { value: 'Adelaide', label: '(GMT+09:30) Adelaide' },
        { value: 'Canberra', label: '(GMT+10:00) Canberra' },
        { value: 'Melbourne', label: '(GMT+10:00) Melbourne' },
        { value: 'Sydney', label: '(GMT+10:00) Sydney' },
        { value: 'Brisbane', label: '(GMT+10:00) Brisbane' },
        { value: 'Hobart', label: '(GMT+10:00) Hobart' },
        { value: 'Vladivostok', label: '(GMT+10:00) Vladivostok' },
        { value: 'Guam', label: '(GMT+10:00) Guam' },
        { value: 'Port Moresby', label: '(GMT+10:00) Port Moresby' },
        { value: 'Solomon Is.', label: '(GMT+10:00) Solomon Is.' },
        { value: 'Magadan', label: '(GMT+11:00) Magadan' },
        { value: 'New Caledonia', label: '(GMT+11:00) New Caledonia' },
        { value: 'Fiji', label: '(GMT+12:00) Fiji' },
        { value: 'Kamchatka', label: '(GMT+12:00) Kamchatka' },
        { value: 'Marshall Is.', label: '(GMT+12:00) Marshall Is.' },
        { value: 'Auckland', label: '(GMT+12:00) Auckland' },
        { value: 'Wellington', label: '(GMT+12:00) Wellington' },
        { value: 'Nuku\'alofa', label: '(GMT+13:00) Nuku\'alofa' }
    ];

    const languageOptions = [
        { value: 'id', label: 'Bahasa Indonesia - Indonesian' },
        { value: 'msa', label: 'Bahasa Melayu - Malay' },
        { value: 'ca', label: 'Català - Catalan' },
        { value: 'cs', label: 'Čeština - Czech' },
        { value: 'da', label: 'Dansk - Danish' },
        { value: 'de', label: 'Deutsch - German' },
        { value: 'en', label: 'English' },
        { value: 'en-gb', label: 'English UK - British English' },
        { value: 'es', label: 'Español - Spanish' },
        { value: 'fil', label: 'Filipino' },
        { value: 'fr', label: 'Français - French' },
        { value: 'ga', label: 'Gaeilge - Irish (beta)' },
        { value: 'gl', label: 'Galego - Galician (beta)' },
        { value: 'hr', label: 'Hrvatski - Croatian' },
        { value: 'it', label: 'Italiano - Italian' },
        { value: 'hu', label: 'Magyar - Hungarian' },
        { value: 'nl', label: 'Nederlands - Dutch' },
        { value: 'no', label: 'Norsk - Norwegian' },
        { value: 'pl', label: 'Polski - Polish' },
        { value: 'pt', label: 'Português - Portuguese' },
        { value: 'ro', label: 'Română - Romanian' },
        { value: 'sk', label: 'Slovenčina - Slovak' },
        { value: 'fi', label: 'Suomi - Finnish' },
        { value: 'sv', label: 'Svenska - Swedish' },
        { value: 'vi', label: 'Tiếng Việt - Vietnamese' },
        { value: 'tr', label: 'Türkçe - Turkish' },
        { value: 'el', label: 'Ελληνικά - Greek' },
        { value: 'bg', label: 'Български език - Bulgarian' },
        { value: 'ru', label: 'Русский - Russian' },
        { value: 'sr', label: 'Српски - Serbian' },
        { value: 'uk', label: 'Українська мова - Ukrainian' },
        { value: 'he', label: 'עִבְרִית - Hebrew' },
        { value: 'ur', label: 'اردو - Urdu (beta)' },
        { value: 'ar', label: 'العربية - Arabic' },
        { value: 'fa', label: 'فارسی - Persian' },
        { value: 'mr', label: 'मराठी - Marathi' },
        { value: 'hi', label: 'हिन्दी - Hindi' },
        { value: 'bn', label: 'বাংলা - Bangla' },
        { value: 'gu', label: 'ગુજરાતી - Gujarati' },
        { value: 'ta', label: 'தமிழ் - Tamil' },
        { value: 'kn', label: 'ಕನ್ನಡ - Kannada' },
        { value: 'th', label: 'ภาษาไทย - Thai' },
        { value: 'ko', label: '한국어 - Korean' },
        { value: 'ja', label: '日本語 - Japanese' },
        { value: 'zh-cn', label: '简体中文 - Simplified Chinese' },
        { value: 'zh-tw', label: '繁體中文 - Traditional Chinese' }
    ];

    const daysOfWeek = [
        { id: 'monday', label: 'Monday' },
        { id: 'tuesday', label: 'Tuesday' },
        { id: 'wednesday', label: 'Wednesday' },
        { id: 'thursday', label: 'Thursday' },
        { id: 'friday', label: 'Friday' },
        { id: 'saturday', label: 'Saturday' },
        { id: 'sunday', label: 'Sunday' }
    ];

    const handleDayToggle = (dayId: string) => {
        setPublicationSchedule(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            Swal.fire({
                text: "Only PNG, JPG and JPEG files are allowed.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await apiFetch(`/webs/${project.id}/favicon`, {
                method: 'POST',
                body: formData,
            });
            onUpdate();
            Swal.fire({
                text: "Logo has been updated!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
        } catch (error) {
            console.error('Failed to upload logo:', error);
            Swal.fire({
                text: "Failed to upload logo.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteLogo = async () => {
        Swal.fire({
            text: "Are you sure you want to remove the project logo?",
            icon: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Yes, delete!",
            cancelButtonText: "No, return",
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-active-light"
            }
        }).then(async function (result) {
            if (result.value) {
                try {
                    await apiFetch(`/webs/${project.id}/favicon`, {
                        method: 'DELETE'
                    });
                    onUpdate();
                    Swal.fire({
                        text: "Logo has been removed!",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                } catch (error) {
                    console.error('Failed to delete logo:', error);
                    Swal.fire({
                        text: "Failed to delete logo.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            }
        });
    };

    const logoUrl = project?.faviconUrl;
    const placeholderUrl = '/assets/media/svg/avatars/blank.svg'; // Or use a colored box logic if preferred, but using blank svg as base for now per template

    // Helper for placeholder if no image
    const renderLogoPreview = () => {
        if (logoUrl) {
            return (
                <div className="image-input-wrapper w-125px h-125px bgi-position-center" style={{ backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundImage: `url('${logoUrl}')` }}></div>
            );
        }
        // Placeholder logic matching ProjectDetailContent
        const colors = ['warning', 'danger', 'primary', 'success', 'info'];
        const color = 'primary'; // Simplified for settings, or pass index
        const iconClass = `ki-outline ki-abstract-10 fs-3x text-inverse-${color}`;

        return (
            <div className={`image-input-wrapper w-125px h-125px bgi-position-center d-flex flex-center bg-light-${color}`}>
                <i className={iconClass}></i>
            </div>
        );
    };

    // Fetch WordPress credentials on mount
    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const response = await apiFetch(`/webs/${project.id}/credentials`) as any;
                if (response.hasCredentials && response.credentials) {
                    setHasCredentials(true);
                    setWpUsername(response.credentials.username || '');
                    setWpPassword('************'); // Masked
                    setWpAutoPublishMode(response.credentials.autoPublishMode || 'draft_only');
                    setWpApprovalEmail(response.credentials.approvalEmail || '');

                    if (response.credentials.github) {
                        setHasGithub(true);
                        setGithubUsername(response.credentials.github.username || '');
                        if (response.credentials.github.repo) {
                            setSelectedRepo({ value: response.credentials.github.repo, label: response.credentials.github.repo });
                        }
                        setGithubFolder(response.credentials.github.folder || 'articles');
                        setGithubBranch(response.credentials.github.branch || 'main');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch credentials:', error);
            }
        };

        if (project?.id) {
            fetchCredentials();
        }
    }, [project?.id]);

    // WordPress credentials handlers
    const handleSaveUsername = async () => {
        if (!newUsername.trim()) {
            Swal.fire('Error', 'Username cannot be empty', 'error');
            return;
        }

        try {
            await apiFetch(`/webs/${project.id}/credentials`, {
                method: 'PUT',
                body: JSON.stringify({
                    credentials: {
                        type: 'wordpress_application_password',
                        baseUrl: project.url,
                        username: newUsername,
                        applicationPassword: wpPassword === '************' ? undefined : wpPassword,
                        autoPublishMode: wpAutoPublishMode
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            setWpUsername(newUsername);
            setEditingUsername(false);
            setNewUsername('');
            Swal.fire('Success', 'Username updated successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update username', 'error');
        }
    };

    const handleSavePassword = async () => {
        if (!newPassword.trim()) {
            Swal.fire('Error', 'Application Password cannot be empty', 'error');
            return;
        }

        try {
            await apiFetch(`/webs/${project.id}/credentials`, {
                method: 'PUT',
                body: JSON.stringify({
                    credentials: {
                        type: 'wordpress_application_password',
                        baseUrl: project.url,
                        username: wpUsername,
                        applicationPassword: newPassword,
                        autoPublishMode: wpAutoPublishMode
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            setWpPassword('************');
            setEditingPassword(false);
            setNewPassword('');
            setHasCredentials(true);
            Swal.fire('Success', 'Application Password updated successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update password', 'error');
        }
    };

    const handleAutoPublishModeChange = async (mode: 'draft_only' | 'manual_approval' | 'auto_publish') => {
        if (!hasCredentials) {
            Swal.fire('Error', 'Please configure WordPress credentials first', 'error');
            return;
        }

        try {
            await apiFetch(`/webs/${project.id}/credentials`, {
                method: 'PUT',
                body: JSON.stringify({
                    credentials: {
                        type: 'wordpress_application_password',
                        baseUrl: project.url,
                        username: wpUsername,
                        applicationPassword: wpPassword === '************' ? undefined : wpPassword,
                        autoPublishMode: mode,
                        approvalEmail: wpApprovalEmail
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            setWpAutoPublishMode(mode);
            Swal.fire('Success', 'Auto-publish mode updated successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update auto-publish mode', 'error');
        }
    };

    const handleSaveApprovalEmail = async () => {
        if (!hasCredentials) {
            Swal.fire('Error', 'Please configure WordPress credentials first', 'error');
            return;
        }

        try {
            await apiFetch(`/webs/${project.id}/credentials`, {
                method: 'PUT',
                body: JSON.stringify({
                    credentials: {
                        type: 'wordpress_application_password',
                        baseUrl: project.url,
                        username: wpUsername,
                        applicationPassword: wpPassword === '************' ? undefined : wpPassword,
                        autoPublishMode: wpAutoPublishMode,
                        approvalEmail: wpApprovalEmail
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            Swal.fire('Success', 'Approval email updated successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update approval email', 'error');
        }
    };

    const handleConnectGithub = () => {
        const token = getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
            `${apiUrl}/webs/${project.id}/github/connect?token=${token}`,
            'Connect GitHub',
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'GITHUB_CONNECTED') {
                if (event.data.success) {
                    setHasGithub(true);
                    Swal.fire('Success', 'GitHub connected successfully', 'success');
                    onUpdate(); // Refresh project data
                } else {
                    Swal.fire('Error', 'Failed to connect GitHub', 'error');
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onUpdate]);

    const fetchGithubRepos = async () => {
        if (!hasGithub) return;
        setLoadingRepos(true);
        try {
            const response = await apiFetch(`/webs/${project.id}/github/repos`) as any[];
            setGithubRepos(response.map(repo => ({ value: repo.name, label: repo.full_name })));
        } catch (error) {
            console.error('Failed to fetch GitHub repos:', error);
            Swal.fire('Error', 'Failed to fetch GitHub repositories', 'error');
        } finally {
            setLoadingRepos(false);
        }
    };

    useEffect(() => {
        if (hasGithub) {
            fetchGithubRepos();
        }
    }, [hasGithub, project.id]);

    const handleSaveGithubSettings = async () => {
        if (!selectedRepo) {
            Swal.fire('Error', 'Please select a repository', 'error');
            return;
        }

        try {
            // We need to fetch current credentials first to preserve token
            const currentCredsResponse = await apiFetch(`/webs/${project.id}/credentials`) as any;
            const currentToken = currentCredsResponse?.credentials?.github?.token;

            await apiFetch(`/webs/${project.id}/credentials`, {
                method: 'PUT',
                body: JSON.stringify({
                    credentials: {
                        github: {
                            token: currentToken, // Preserve token
                            username: githubUsername,
                            repo: selectedRepo.value,
                            branch: githubBranch,
                            folder: githubFolder
                        }
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            Swal.fire('Success', 'GitHub settings saved successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to save GitHub settings', 'error');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await apiFetch(`/webs/${project.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    nickname: projectName,
                    businessDescription,
                    businessTargetAudience: businessAudience,
                    publicationSchedule,
                    timezone,
                    language,
                    country
                }),
                headers: { 'Content-Type': 'application/json' },
            });
            onUpdate();
            Swal.fire({
                text: "Project settings have been saved!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
            Swal.fire({
                text: "Failed to update settings.",
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
        <>
            <div className="card mb-5 mb-xl-10">
                {/*begin::Card header*/}
                <div className="card-header">
                    {/*begin::Card title*/}
                    <div className="card-title fs-3 fw-bold">Project Settings</div>
                    {/*end::Card title*/}
                </div>
                {/*end::Card header*/}
                {/*begin::Form*/}
                <form id="kt_project_settings_form" className="form" onSubmit={handleSaveSettings}>
                    {/*begin::Card body*/}
                    <div className="card-body p-9">
                        {/*begin::Row*/}
                        <div className="row mb-5">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Project Logo</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-lg-8">
                                {/*begin::Image input*/}
                                <div className={`image-input image-input-outline ${!logoUrl ? 'image-input-empty' : ''}`} data-kt-image-input="true">
                                    {/*begin::Preview existing avatar*/}
                                    {renderLogoPreview()}
                                    {/*end::Preview existing avatar*/}
                                    {/*begin::Label*/}
                                    <label className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow" data-kt-image-input-action="change" data-bs-toggle="tooltip" title="Change avatar">
                                        <i className="ki-outline ki-pencil fs-7"></i>
                                        {/*begin::Inputs*/}
                                        <input
                                            type="file"
                                            name="avatar"
                                            accept=".png, .jpg, .jpeg"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                        <input type="hidden" name="avatar_remove" />
                                        {/*end::Inputs*/}
                                    </label>
                                    {/*end::Label*/}
                                    {/*begin::Cancel*/}
                                    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow" data-kt-image-input-action="cancel" data-bs-toggle="tooltip" title="Cancel avatar">
                                        <i className="ki-outline ki-cross fs-2"></i>
                                    </span>
                                    {/*end::Cancel*/}
                                    {/*begin::Remove*/}
                                    {logoUrl && (
                                        <span
                                            className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow"
                                            data-kt-image-input-action="remove"
                                            data-bs-toggle="tooltip"
                                            title="Remove avatar"
                                            onClick={handleDeleteLogo}
                                        >
                                            <i className="ki-outline ki-cross fs-2"></i>
                                        </span>
                                    )}
                                    {/*end::Remove*/}
                                </div>
                                {/*end::Image input*/}
                                {/*begin::Hint*/}
                                <div className="form-text">Allowed file types: png, jpg, jpeg.</div>
                                {/*end::Hint*/}
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Project Name</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <input
                                    type="text"
                                    className="form-control form-control-solid"
                                    name="name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Project URL</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <input
                                    type="text"
                                    className="form-control form-control-solid"
                                    name="url"
                                    value={project?.url || ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Business description</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <textarea
                                    name="description"
                                    className="form-control form-control-solid h-100px"
                                    value={businessDescription}
                                    onChange={(e) => setBusinessDescription(e.target.value)}
                                ></textarea>
                            </div>
                            {/*begin::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Business Audience</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <textarea
                                    name="audience"
                                    className="form-control form-control-solid h-100px"
                                    value={businessAudience}
                                    onChange={(e) => setBusinessAudience(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Country</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(opt => opt.value === country)}
                                    onChange={(option) => setCountry(option?.value || '')}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select a country.."
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            minHeight: '44px',
                                            borderRadius: '0.475rem',
                                            borderColor: 'var(--bs-gray-300)',
                                            backgroundColor: 'var(--bs-body-bg)',
                                            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(80, 165, 241, 0.25)' : 'none',
                                            '&:hover': {
                                                borderColor: 'var(--bs-gray-400)'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            borderRadius: '0.475rem',
                                            border: '1px solid var(--bs-gray-300)',
                                            boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)'
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            padding: '0.5rem 0'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? 'var(--bs-primary)'
                                                : state.isFocused
                                                    ? 'var(--bs-gray-100)'
                                                    : 'transparent',
                                            color: state.isSelected ? 'var(--bs-primary-inverse)' : 'var(--bs-gray-700)',
                                            cursor: 'pointer',
                                            '&:active': {
                                                backgroundColor: 'var(--bs-primary)'
                                            }
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-500)'
                                        })
                                    }}
                                />
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Article Language</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <Select
                                    options={languageOptions}
                                    value={languageOptions.find(opt => opt.value === language)}
                                    onChange={(option) => setLanguage(option?.value || 'en')}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select a language.."
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            minHeight: '44px',
                                            borderRadius: '0.475rem',
                                            borderColor: 'var(--bs-gray-300)',
                                            backgroundColor: 'var(--bs-body-bg)',
                                            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(80, 165, 241, 0.25)' : 'none',
                                            '&:hover': {
                                                borderColor: 'var(--bs-gray-400)'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            borderRadius: '0.475rem',
                                            border: '1px solid var(--bs-gray-300)',
                                            boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)'
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            padding: '0.5rem 0'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? 'var(--bs-primary)'
                                                : state.isFocused
                                                    ? 'var(--bs-gray-100)'
                                                    : 'transparent',
                                            color: state.isSelected ? 'var(--bs-primary-inverse)' : 'var(--bs-gray-700)',
                                            cursor: 'pointer',
                                            '&:active': {
                                                backgroundColor: 'var(--bs-primary)'
                                            }
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-500)'
                                        })
                                    }}
                                />
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Time Zone</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <Select
                                    options={timezoneOptions}
                                    value={timezoneOptions.find(opt => opt.value === timezone)}
                                    onChange={(option) => setTimezone(option?.value || 'UTC')}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select a timezone.."
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            minHeight: '44px',
                                            borderRadius: '0.475rem',
                                            borderColor: 'var(--bs-gray-300)',
                                            backgroundColor: 'var(--bs-body-bg)',
                                            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(80, 165, 241, 0.25)' : 'none',
                                            '&:hover': {
                                                borderColor: 'var(--bs-gray-400)'
                                            }
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            borderRadius: '0.475rem',
                                            border: '1px solid var(--bs-gray-300)',
                                            boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)'
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            padding: '0.5rem 0'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? 'var(--bs-primary)'
                                                : state.isFocused
                                                    ? 'var(--bs-gray-100)'
                                                    : 'transparent',
                                            color: state.isSelected ? 'var(--bs-primary-inverse)' : 'var(--bs-gray-700)',
                                            cursor: 'pointer',
                                            '&:active': {
                                                backgroundColor: 'var(--bs-primary)'
                                            }
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-700)'
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: 'var(--bs-gray-500)'
                                        })
                                    }}
                                />
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Publication Schedule</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9">
                                <div className="d-flex flex-wrap fw-semibold h-100">
                                    {daysOfWeek.map(day => (
                                        <div key={day.id} className="form-check form-check-custom form-check-solid me-9 mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value={day.id}
                                                id={day.id}
                                                checked={publicationSchedule.includes(day.id)}
                                                onChange={() => handleDayToggle(day.id)}
                                            />
                                            <label className="form-check-label ms-3" htmlFor={day.id}>{day.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Auto-publish to CMS</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9">
                                <div className="form-check form-switch form-check-custom form-check-solid">
                                    <input className="form-check-input" type="checkbox" value="" id="status" name="status" defaultChecked={true} />
                                    <label className="form-check-label fw-semibold text-gray-500 ms-3" htmlFor="status">Active</label>
                                </div>
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                        {/*begin::Row*/}
                        <div className="row mb-8">
                            {/*begin::Col*/}
                            <div className="col-xl-3">
                                <div className="fs-6 fw-semibold mt-2 mb-3">Auto-publish Mode</div>
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-xl-9 fv-row">
                                <div className="mb-3">
                                    <label className="d-flex align-items-center fs-5 fw-semibold">
                                        <span className="required">Auto-publish Mode</span>
                                        <span
                                            className="ms-1"
                                            data-bs-toggle="tooltip"
                                            title="Choose how new articles are sent to WordPress"
                                        >
                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                        </span>
                                    </label>
                                    <div className="fs-7 fw-semibold text-muted">Draft only, require approval, or publish automatically.</div>
                                </div>
                                <div className="fv-row">
                                    <div className="btn-group w-100" data-kt-buttons="true" data-kt-buttons-target="[data-kt-button]">
                                        <label
                                            className={`btn btn-outline btn-active-success btn-color-muted ${wpAutoPublishMode === 'draft_only' ? 'active' : ''}`}
                                            data-kt-button="true"
                                        >
                                            <input
                                                className="btn-check"
                                                type="radio"
                                                name="auto_publish_mode"
                                                value="draft_only"
                                                checked={wpAutoPublishMode === 'draft_only'}
                                                onChange={() => handleAutoPublishModeChange('draft_only')}
                                            />
                                            Draft Only
                                        </label>
                                        <label
                                            className={`btn btn-outline btn-active-success btn-color-muted ${wpAutoPublishMode === 'manual_approval' ? 'active' : ''}`}
                                            data-kt-button="true"
                                        >
                                            <input
                                                className="btn-check"
                                                type="radio"
                                                name="auto_publish_mode"
                                                value="manual_approval"
                                                checked={wpAutoPublishMode === 'manual_approval'}
                                                onChange={() => handleAutoPublishModeChange('manual_approval')}
                                            />
                                            Manual Approval
                                        </label>
                                        <label
                                            className={`btn btn-outline btn-active-success btn-color-muted ${wpAutoPublishMode === 'auto_publish' ? 'active' : ''}`}
                                            data-kt-button="true"
                                        >
                                            <input
                                                className="btn-check"
                                                type="radio"
                                                name="auto_publish_mode"
                                                value="auto_publish"
                                                checked={wpAutoPublishMode === 'auto_publish'}
                                                onChange={() => handleAutoPublishModeChange('auto_publish')}
                                            />
                                            Auto Publish
                                        </label>
                                    </div>
                                </div>
                                {wpAutoPublishMode === 'manual_approval' && (
                                    <div className="mt-5">
                                        <label className="fs-6 fw-semibold mb-2">Approval Email</label>
                                        <div className="input-group">
                                            <input
                                                type="email"
                                                className="form-control form-control-solid"
                                                placeholder="Enter email for approval notifications"
                                                value={wpApprovalEmail}
                                                onChange={(e) => setWpApprovalEmail(e.target.value)}
                                            />
                                            <button className="btn btn-light-primary" type="button" onClick={handleSaveApprovalEmail}>
                                                Save
                                            </button>
                                        </div>
                                        <div className="form-text">We will send an email to this address when an article is ready for review.</div>
                                    </div>
                                )}
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                    </div>
                    {/*end::Card body*/}
                    {/*begin::Card footer*/}
                    <div className="card-footer d-flex justify-content-end py-6 px-9">
                        <button type="reset" className="btn btn-light btn-active-light-primary me-2">Discard</button>
                        <button type="submit" className="btn btn-primary" id="kt_project_settings_submit">Save Changes</button>
                    </div>
                    {/*end::Card footer*/}
                </form>
                {/*end:Form*/}
            </div>
            {/*end::Project Settings Card*/}

            {/*begin::WordPress Credentials*/}
            <div className="card mb-5 mb-xl-10">
                {/*begin::Card header*/}
                <div className="card-header border-0 cursor-pointer" role="button" data-bs-toggle="collapse" data-bs-target="#kt_wordpress_credentials">
                    <div className="card-title m-0">
                        <h3 className="fw-bold m-0">WordPress Credentials</h3>
                    </div>
                </div>
                {/*end::Card header*/}
                {/*begin::Content*/}
                <div id="kt_wordpress_credentials" className="collapse show">
                    {/*begin::Card body*/}
                    <div className="card-body border-top p-9">
                        {/*begin::WordPress Username*/}
                        <div className="d-flex flex-wrap align-items-center">
                            {/*begin::Label*/}
                            <div id="kt_wp_username">
                                <div className="fs-6 fw-bold mb-1">WordPress Username</div>
                                <div className="fw-semibold text-gray-600">{wpUsername || 'Not configured'}</div>
                            </div>
                            {/*end::Label*/}
                            {/*begin::Edit*/}
                            <div id="kt_wp_username_edit" className={`flex-row-fluid ${editingUsername ? '' : 'd-none'}`}>
                                {/*begin::Form*/}
                                <div className="row mb-6">
                                    <div className="col-lg-6 mb-4 mb-lg-0">
                                        <div className="fv-row mb-0">
                                            <label htmlFor="wp_username" className="form-label fs-6 fw-bold mb-3">Enter WordPress Username</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg form-control-solid"
                                                id="wp_username"
                                                placeholder="WordPress Username"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <button type="button" className="btn btn-primary me-2 px-6" onClick={handleSaveUsername}>Update Username</button>
                                    <button type="button" className="btn btn-color-gray-500 btn-active-light-primary px-6" onClick={() => { setEditingUsername(false); setNewUsername(''); }}>Cancel</button>
                                </div>
                                {/*end::Form*/}
                            </div>
                            {/*end::Edit*/}
                            {/*begin::Action*/}
                            <div id="kt_wp_username_button" className={`ms-auto ${editingUsername ? 'd-none' : ''}`}>
                                <button className="btn btn-light btn-active-light-primary" onClick={() => { setEditingUsername(true); setNewUsername(wpUsername); }}>Change Username</button>
                            </div>
                            {/*end::Action*/}
                        </div>
                        {/*end::WordPress Username*/}
                        {/*begin::Separator*/}
                        <div className="separator separator-dashed my-6"></div>
                        {/*end::Separator*/}
                        {/*begin::Application Password*/}
                        <div className="d-flex flex-wrap align-items-center mb-10">
                            {/*begin::Label*/}
                            <div id="kt_wp_password">
                                <div className="fs-6 fw-bold mb-1">Application Password</div>
                                <div className="fw-semibold text-gray-600">{wpPassword || 'Not configured'}</div>
                            </div>
                            {/*end::Label*/}
                            {/*begin::Edit*/}
                            <div id="kt_wp_password_edit" className={`flex-row-fluid ${editingPassword ? '' : 'd-none'}`}>
                                {/*begin::Form*/}
                                <div className="row mb-1">
                                    <div className="col-lg-6">
                                        <div className="fv-row mb-0">
                                            <label htmlFor="wp_app_password" className="form-label fs-6 fw-bold mb-3">New Application Password</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg form-control-solid"
                                                id="wp_app_password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-text mb-5">Generate an Application Password in your WordPress dashboard under Users → Profile → Application Passwords</div>
                                <div className="d-flex">
                                    <button type="button" className="btn btn-primary me-2 px-6" onClick={handleSavePassword}>Update Password</button>
                                    <button type="button" className="btn btn-color-gray-500 btn-active-light-primary px-6" onClick={() => { setEditingPassword(false); setNewPassword(''); }}>Cancel</button>
                                </div>
                                {/*end::Form*/}
                            </div>
                            {/*end::Edit*/}
                            {/*begin::Action*/}
                            <div id="kt_wp_password_button" className={`ms-auto ${editingPassword ? 'd-none' : ''}`}>
                                <button className="btn btn-light btn-active-light-primary" onClick={() => setEditingPassword(true)}>Update Password</button>
                            </div>
                            {/*end::Action*/}
                        </div>
                        {/*end::Application Password*/}
                    </div>
                    {/*end::Card body*/}
                </div>
                {/*end::Content*/}
            </div>
            {/*end::WordPress Credentials*/}

            {/*begin::Connected Accounts*/}
            <div className="card mb-5 mb-xl-10">
                {/*begin::Card header*/}
                <div
                    className="card-header border-0 cursor-pointer"
                    role="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#kt_account_connected_accounts"
                    aria-expanded="true"
                    aria-controls="kt_account_connected_accounts"
                >
                    <div className="card-title m-0">
                        <h3 className="fw-bold m-0">Connected Accounts</h3>
                    </div>
                </div>
                {/*end::Card header*/}
                {/*begin::Content*/}
                <div id="kt_account_connected_accounts" className="collapse show">
                    {/*begin::Card body*/}
                    <div className="card-body border-top p-9">
                        {/*begin::Notice*/}
                        <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed mb-9 p-6">
                            <i className="ki-outline ki-design-1 fs-2tx text-primary me-4"></i>
                            <div className="d-flex flex-stack flex-grow-1">
                                <div className="fw-semibold">
                                    <div className="fs-6 text-gray-700">
                                        Two-factor authentication adds an extra layer of security to your account. To log in, you'll need to provide a 4 digit code.{' '}
                                        <a href="#" className="fw-bold">Learn More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*end::Notice*/}
                        {/*begin::Items*/}
                        <div className="py-2">
                            {/*begin::Item*/}
                            <div className="d-flex flex-stack">
                                <div className="d-flex">
                                    <img src="/assets/media/svg/brand-logos/google-icon.svg" className="w-30px me-6" alt="Google" />
                                    <div className="d-flex flex-column">
                                        <a href="#" className="fs-5 text-gray-900 text-hover-primary fw-bold">Google</a>
                                        <div className="fs-6 fw-semibold text-gray-500">Plan properly your workflow</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <div className="form-check form-check-solid form-check-custom form-switch">
                                        <input className="form-check-input w-45px h-30px" type="checkbox" id="googleswitch" defaultChecked />
                                        <label className="form-check-label" htmlFor="googleswitch"></label>
                                    </div>
                                </div>
                            </div>
                            {/*end::Item*/}
                            <div className="separator separator-dashed my-5"></div>
                            {/*begin::Item*/}
                            <div className="d-flex flex-stack">
                                <div className="d-flex">
                                    <img src="/assets/media/svg/brand-logos/github.svg" className="w-30px me-6" alt="GitHub" />
                                    <div className="d-flex flex-column">
                                        <a href="#" className="fs-5 text-gray-900 text-hover-primary fw-bold">Github</a>
                                        <div className="fs-6 fw-semibold text-gray-500">
                                            {hasGithub ? 'Connected as ' + githubUsername : 'Connect your repository for backups'}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${hasGithub ? 'btn-light-primary' : 'btn-light'}`}
                                        onClick={handleConnectGithub}
                                    >
                                        {hasGithub ? 'Re-Connect' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                            {hasGithub && (
                                <div className="mt-5 border-top pt-5">
                                    <div className="row mb-6">
                                        <label className="col-lg-4 col-form-label fw-semibold fs-6">Repository</label>
                                        <div className="col-lg-8 fv-row">
                                            <Select
                                                options={githubRepos}
                                                value={selectedRepo}
                                                onChange={(option) => setSelectedRepo(option)}
                                                isLoading={loadingRepos}
                                                placeholder="Select a repository..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: '44px',
                                                        borderRadius: '0.475rem',
                                                        borderColor: 'var(--bs-gray-300)',
                                                        backgroundColor: 'var(--bs-body-bg)',
                                                        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(80, 165, 241, 0.25)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'var(--bs-gray-400)'
                                                        }
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 9999,
                                                        backgroundColor: 'var(--bs-body-bg)',
                                                        borderRadius: '0.475rem',
                                                        border: '1px solid var(--bs-gray-300)',
                                                        boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)'
                                                    }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        padding: '0.5rem 0'
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isSelected
                                                            ? 'var(--bs-primary)'
                                                            : state.isFocused
                                                                ? 'var(--bs-gray-100)'
                                                                : 'transparent',
                                                        color: state.isSelected ? 'var(--bs-primary-inverse)' : 'var(--bs-gray-700)',
                                                        cursor: 'pointer',
                                                        '&:active': {
                                                            backgroundColor: 'var(--bs-primary)'
                                                        }
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: 'var(--bs-gray-700)'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        color: 'var(--bs-gray-700)'
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        color: 'var(--bs-gray-500)'
                                                    })
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-6">
                                        <label className="col-lg-4 col-form-label fw-semibold fs-6">Folder Path</label>
                                        <div className="col-lg-8 fv-row">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg form-control-solid"
                                                placeholder="e.g. content/blog"
                                                value={githubFolder}
                                                onChange={(e) => setGithubFolder(e.target.value)}
                                            />
                                            <div className="form-text">Path where articles will be saved (default: articles)</div>
                                        </div>
                                    </div>
                                    <div className="row mb-6">
                                        <label className="col-lg-4 col-form-label fw-semibold fs-6">Branch</label>
                                        <div className="col-lg-8 fv-row">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg form-control-solid"
                                                placeholder="main"
                                                value={githubBranch}
                                                onChange={(e) => setGithubBranch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-8 offset-lg-4">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleSaveGithubSettings}
                                            >
                                                Save GitHub Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/*end::Item*/}
                            <div className="separator separator-dashed my-5"></div>
                            {/*begin::Item*/}
                            <div className="d-flex flex-stack">
                                <div className="d-flex">
                                    <img src="/assets/media/svg/brand-logos/slack-icon.svg" className="w-30px me-6" alt="Slack" />
                                    <div className="d-flex flex-column">
                                        <a href="#" className="fs-5 text-gray-900 text-hover-primary fw-bold">Slack</a>
                                        <div className="fs-6 fw-semibold text-gray-500">Integrate project discussions</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <div className="form-check form-check-solid form-check-custom form-switch">
                                        <input className="form-check-input w-45px h-30px" type="checkbox" id="slackswitch" />
                                        <label className="form-check-label" htmlFor="slackswitch"></label>
                                    </div>
                                </div>
                            </div>
                            {/*end::Item*/}
                        </div>
                        {/*end::Items*/}
                    </div>
                    {/*end::Card body*/}
                    {/*begin::Card footer*/}
                    <div className="card-footer d-flex justify-content-end py-6 px-9">
                        <button className="btn btn-light btn-active-light-primary me-2" type="button">Discard</button>
                        <button className="btn btn-primary" type="button">Save Changes</button>
                    </div>
                    {/*end::Card footer*/}
                </div>
                {/*end::Content*/}
            </div>
            {/*end::Connected Accounts*/}

            {/*begin::Deactivate Web*/}
            <div className="card">
                <div
                    className="card-header border-0 cursor-pointer"
                    role="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#kt_web_deactivate"
                    aria-expanded="true"
                    aria-controls="kt_web_deactivate"
                >
                    <div className="card-title m-0">
                        <h3 className="fw-bold m-0">Deactivate Web</h3>
                    </div>
                </div>
                <div id="kt_web_deactivate" className="collapse show">
                    <form className="form">
                        <div className="card-body border-top p-9">
                            <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed mb-9 p-6">
                                <i className="ki-outline ki-information fs-2tx text-warning me-4"></i>
                                <div className="d-flex flex-stack flex-grow-1">
                                    <div className="fw-semibold">
                                        <h4 className="text-gray-900 fw-bold">You are deactivating this web</h4>
                                        <div className="fs-6 text-gray-700">
                                            Deactivating stops publishing and processing for this site. You can reactivate later.{' '}
                                            <a className="fw-bold" href="#">Learn more</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-check form-check-solid fv-row">
                                <input name="deactivate" className="form-check-input" type="checkbox" value="" id="deactivate_web" />
                                <label className="form-check-label fw-semibold ps-2 fs-6" htmlFor="deactivate_web">I confirm deactivation of this web</label>
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-content-end py-6 px-9">
                            <button type="button" className="btn btn-danger fw-semibold">Deactivate Web</button>
                        </div>
                    </form>
                </div>
            </div>
            {/*end::Deactivate Web*/}
        </>
    );
};

export default SettingsTab;
