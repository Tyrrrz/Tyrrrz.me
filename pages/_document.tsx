import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';

type MyDocumentProps = DocumentInitialProps & {
  isRawResponse: boolean;
};

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await super.getInitialProps(ctx);
    return { ...initialProps, isRawResponse: ctx.pathname.endsWith('.svg') };
  }

  render() {
    // For raw-response pages (e.g. SVG images), render only the page content
    // with no HTML wrapper so the response is the bare element returned by
    // the page component (combined with the Content-Type header set in
    // next.config.js, this serves as a proper image/SVG).
    if (this.props.isRawResponse) {
      return <Main />;
    }

    // Default rendering for all other pages
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
