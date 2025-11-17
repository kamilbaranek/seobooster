import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class AppDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const pagePath = this.props.__NEXT_DATA__?.page ?? '';
    const isDashboardRoute = pagePath.startsWith('/dashboard');

    return (
      <Html lang="en">
        <Head>
          {isDashboardRoute && (
            <>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
              <link href="/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" />
              <link href="/assets/plugins/custom/datatables/datatables.bundle.css" rel="stylesheet" />
              <link href="/assets/plugins/global/plugins.bundle.css" rel="stylesheet" />
              <link href="/assets/css/style.bundle.css" rel="stylesheet" />
            </>
          )}
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
