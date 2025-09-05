/* eslint-disable @next/next/no-document-import-in-page */
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getInitColorSchemeScript } from '@mui/joy';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="eng">
        <Head />
        <body>
          {getInitColorSchemeScript({ defaultMode: 'dark' })}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
