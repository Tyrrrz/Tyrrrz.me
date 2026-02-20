import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';

type MyDocumentProps = DocumentInitialProps & {
  isSvgPage: boolean;
};

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await super.getInitialProps(ctx);
    return { ...initialProps, isSvgPage: ctx.pathname === '/github-stats.svg' };
  }

  render() {
    // For the SVG page, render only the page content with no HTML wrapper
    // so the response is a raw <svg> element (combined with the Content-Type
    // header set in next.config.js, this serves as a proper SVG image).
    if (this.props.isSvgPage) {
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
