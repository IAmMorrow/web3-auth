import type { AppProps } from "next/app";
import { StyleProvider } from "@ledgerhq/react-ui";
import { ThemeNames } from "@ledgerhq/react-ui/styles";
import { GlobalStyle } from "../styles/globalStyles";
import Head from "next/head";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { theme = "dark" } = router.query;
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StyleProvider
        selectedPalette={theme as ThemeNames | undefined}
        fontsPath="/fonts"
      >
        <GlobalStyle />
        <Component {...pageProps} />
      </StyleProvider>
    </>
  );
}
