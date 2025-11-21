import React from "react";
import AppNavbar from "./AppNavbar";
import type { DashboardWeb } from "./DashboardLayout";

interface AppHeaderProps {
  webs: DashboardWeb[];
}

const MAX_VISIBLE_WEBS = 3;

const getInitial = (web: DashboardWeb) => {
  const source = web.nickname || web.url || "";
  const match = source.match(/[a-zA-Z0-9]/);
  return match ? match[0].toUpperCase() : "?";
};

const AppHeader: React.FC<AppHeaderProps> = ({ webs }) => {
  const visibleWebs = webs.slice(0, MAX_VISIBLE_WEBS);

  return (
    <div id="kt_app_header" className="app-header d-flex">
      <div
        className="app-container container-fluid d-flex align-items-center justify-content-between"
        id="kt_app_header_container"
      >
        <div className="app-header-logo d-flex flex-center">
          <a href="/dashboard">
            <img
              alt="SEO Booster"
              src="/assets/media/logos/demo-58.svg"
              className="mh-25px"
            />
          </a>
          <button
            className="btn btn-icon btn-sm btn-active-color-primary d-flex d-lg-none"
            id="kt_app_sidebar_mobile_toggle"
          >
            <i className="ki-outline ki-abstract-14 fs-1" />
          </button>
        </div>
        <div
          className="d-flex flex-lg-grow-1 flex-stack"
          id="kt_app_header_wrapper"
        >
          <div
            className="app-header-wrapper d-flex align-items-center justify-content-around justify-content-lg-between flex-wrap gap-6 gap-lg-0 mb-6 mb-lg-0"
            data-kt-swapper="true"
            data-kt-swapper-mode="{default: 'prepend', lg: 'prepend'}"
            data-kt-swapper-parent="{default: '#kt_app_content_container', lg: '#kt_app_header_wrapper'}"
          >
            <div className="d-flex flex-column justify-content-center">
              <h1 className="text-gray-900 fw-bold fs-6 mb-2">SEO Booster</h1>
              <ul className="breadcrumb breadcrumb-separatorless fw-semibold fs-base">
                <li className="breadcrumb-item text-muted">
                  <a
                    href="/dashboard"
                    className="text-muted text-hover-primary"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="breadcrumb-item text-muted">/</li>
                <li className="breadcrumb-item text-muted">Overview</li>
              </ul>
            </div>
            <div className="d-none d-md-block h-40px border-start border-gray-200 mx-10" />
            <div className="d-flex gap-3 gap-lg-8 flex-wrap">
              {visibleWebs.map((web) => (
                <div className="d-flex align-items-center gap-2" key={web.id}>
                  <div className="rounded d-flex flex-center w-40px h-40px flex-shrink-0 bg-gray-200 overflow-hidden">
                    {web.faviconUrl && web.faviconStatus === "SUCCESS" ? (
                      <img
                        src={web.faviconUrl}
                        alt={web.nickname || web.url}
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <span className="fw-bold text-gray-700">
                        {getInitial(web)}
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold fs-base text-gray-900">
                      {web.nickname || web.url}
                    </span>
                    <span className="fw-semibold fs-7 text-gray-500">
                      Uplift: 64%
                    </span>
                  </div>
                </div>
              ))}
              {visibleWebs.length === 0 && (
                <div className="d-flex align-items-center gap-2 text-gray-500 fw-semibold">
                  Přidej první web pro personalizovanou strategii
                </div>
              )}
              <a
                href="/onboarding/add-site"
                className="btn btn-icon border border-200 bg-gray-100 btn-color-gray-600 btn-active-primary ms-2 ms-lg-6"
              >
                <i className="ki-outline ki-plus fs-3" />
              </a>
            </div>
          </div>
          <AppNavbar />
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
