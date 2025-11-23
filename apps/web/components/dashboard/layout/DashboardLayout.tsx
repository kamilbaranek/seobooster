import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useDashboardInteractions } from '../hooks/useDashboardInteractions';

export interface DashboardWeb {
  id: string;
  nickname?: string;
  url?: string;
  faviconUrl?: string;
  faviconStatus?: string;
  screenshotUrl?: string;
  lastArticleCreatedAt?: string | null;
  articleCount?: number;
  articlePublishedCount?: number;
  status?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  useDashboardInteractions(true);

  React.useEffect(() => {
    const body = document.body;
    body.id = 'kt_app_body';
    body.setAttribute('data-kt-app-header-fixed', 'true');
    body.setAttribute('data-kt-app-header-fixed-mobile', 'true');
    body.setAttribute('data-kt-app-sidebar-enabled', 'true');
    body.setAttribute('data-kt-app-sidebar-fixed', 'true');
    body.setAttribute('data-kt-app-sidebar-push-toolbar', 'true');
    body.setAttribute('data-kt-app-sidebar-push-footer', 'true');
    body.classList.add('app-default');

    return () => {
      // Cleanup if necessary, though usually fine to leave for SPA navigation
      // body.removeAttribute('data-kt-app-header-fixed');
      // ...
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
        <Header />
        <div className="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
          <Sidebar />
          <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
            <div className="d-flex flex-column flex-column-fluid">
              <div id="kt_app_content" className="app-content flex-column-fluid">
                <div id="kt_app_content_container" className="app-container container-fluid">
                  {children}
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
