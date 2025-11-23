import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { countryOptions } from '../../../lib/countryOptions';
import { apiFetch } from '../../../lib/api-client';

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
        project?.publicationSchedule || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    );
    const [timezone, setTimezone] = useState(project?.timezone || 'UTC');
    const [language, setLanguage] = useState(project?.language || 'en');
    const [country, setCountry] = useState(project?.country || '');
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
        <div className="card">
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
                    <div className="row">
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
    );
};

export default SettingsTab;
