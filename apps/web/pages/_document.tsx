import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class AppDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
          <link href="/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" />
          <link href="/assets/plugins/custom/datatables/datatables.bundle.css" rel="stylesheet" />
          <link href="/assets/plugins/global/plugins.bundle.css" rel="stylesheet" />
          <link href="/assets/css/style.bundle.css" rel="stylesheet" />
          <style
            // Základní layout proměnné z Metronic SCSS (_root.scss)
            dangerouslySetInnerHTML={{
              __html: `
                :root {
                  --bs-app-bg-color: #F1F1F4;
                  --bs-app-blank-bg-color: #F1F1F4;
                  --bs-app-header-base-bg-color: #F1F1F4;
                  --bs-app-toolbar-base-bg-color: #ffffff;
                  --bs-app-toolbar-sticky-bg-color: #ffffff;
                  --bs-app-sidebar-base-bg-color: transparent;
                  --bs-app-sidebar-panel-base-bg-color: #ffffff;
                }

                [data-bs-theme="dark"] {
                  --bs-app-bg-color: #0F1014;
                  --bs-app-blank-bg-color: #0F1014;
                  --bs-app-header-base-bg-color: #0F1014;
                  --bs-app-header-base-border-bottom: 1px solid #F9F9F9;
                  --bs-app-toolbar-base-bg-color: #15171C;
                  --bs-app-toolbar-sticky-bg-color: #1e1e2d;
                  --bs-app-toolbar-sticky-box-shadow: none;
                  --bs-app-sidebar-base-bg-color: transparent;
                  --bs-app-sidebar-panel-base-bg-color: #15171C;
                }

                .app-navbar-item {
                  position: relative;
                }

                .menu-sub.menu-sub-dropdown {
                  display: none;
                }

                .menu-sub.menu-sub-dropdown.show {
                  display: block;
                  position: absolute;
                  inset: auto 0 auto auto;
                  z-index: 107;
                }

                #kt_app_sidebar_footer .menu-sub.menu-sub-dropdown.show {
                  inset: auto auto 100% auto;
                }
              `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                var defaultThemeMode = "system";
                var themeMode;
                if (document.documentElement) {
                  if (document.documentElement.hasAttribute("data-bs-theme-mode")) {
                    themeMode = document.documentElement.getAttribute("data-bs-theme-mode");
                  } else {
                    if (localStorage.getItem("data-bs-theme") !== null) {
                      themeMode = localStorage.getItem("data-bs-theme");
                    } else {
                      themeMode = defaultThemeMode;
                    }
                  }
                  if (themeMode === "system") {
                    themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  }
                  document.documentElement.setAttribute("data-bs-theme", themeMode);
                }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AppDocument;
