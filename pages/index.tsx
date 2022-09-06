import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { Box, Button, Flex, Text } from "@ledgerhq/react-ui";
import LedgerLivePlatformSDK, {
  Account,
  WindowMessageTransport,
} from "@ledgerhq/live-app-sdk";
import appRegistry from "../src/appRegistry.json"

import styled from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccountSelector } from "../src/components/AccountSelector";
import { SiweMessage } from "siwe";
import axios from "axios";
import { JWTRequestResult, NonceRequestResult, VerifyRequestResult } from "../src/types/api";
import { withIronSessionSsr } from "iron-session/next";
import { ironOptions } from "../src/config";
import { AuthParams } from "../src/types/params";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: ${({ theme }) => theme.colors.background.main};

  @media (min-width: 601px) {
    &:before,
    &:after {
      content: "";
      min-height: 30px;
      display: block;
      box-flex: 1;
      flex-grow: 1;
      height: 24px;
    }
  }
`;

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  position: relative;
  z-index: 2;

  @media (min-width: 601px) {
    border: 1px solid ${({ theme }) => theme.colors.neutral.c50};
    border-radius: 12px;
    display: block;
    flex-shrink: 0;
    margin: 0 auto;
    min-height: 0;
    transition: 0.2s;
    width: 450px;
  }
`;

const InnerContainer = styled.div`
  box-flex: 1;
  flex-grow: 1;
  overflow: hidden;
  padding: 24px 24px 36px;

  @media (min-width: 450px) {
    padding: 48px 40px 36px;
  }

  @media (min-width: 601px) {
    height: auto;
    min-height: 500px;
    overflow-y: auto;
    transition: 0.2s;
  }
`;

const WidgetHeader = styled.header`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.c50};
  height: 36px;
  left: 0;
  padding: 0 16px;
  position: absolute;
  right: 0;
  top: 0;
`;

const WidgetContent = styled.main`
  margin: auto -24px;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 24px;
  overflow: hidden;

  @media (min-width: 450px) {
    border-left-width: 40px;
    border-right-width: 40px;
    margin: auto -40px;
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const HeadingText = styled.h1`
  padding-top: 16px;
  padding-bottom: 0px;
  word-break: break-word;
  text-align: center;
  line-height: 1.3333;
`;

const HeadingSubtext = styled.div`
  padding-top: 8px;
  padding-bottom: 0px;
  text-align: center;
  line-height: 1.5;
`;

type State = {
  nonce: string | null;
  account: Account | null;
};

function initialState(): State {
  return {
    nonce: null,
    account: null,
  };
}

type HomeProps = {
  connectedAddress: string | null,
  params: AuthParams,
}

const Home = ({ connectedAddress, params }: HomeProps) => {
  const platformSDK = useRef<LedgerLivePlatformSDK | null>(null);
  const [state, setState] = useState<State>(initialState());
  const [connected, setConnected] = useState<string | null>(connectedAddress);

  console.log({state, connected, params});
  const updateNonce = useCallback(() => {
    axios.get<NonceRequestResult>("/api/nonce").then(({ data }) => {
      setState(oldState => ({
        ...oldState,
        nonce: data.nonce,
      }))
    });
  }, []);

  const redirectWithToken = useCallback(async () => {
    const { data: jwtRes } = await axios.get<JWTRequestResult>(`/api/jwt?appId=${params.app.id}`);

    const url = new URL(params.app.redirectURI);
    if (params.state) {
      url.searchParams.set("state", params.state);
    }
    url.searchParams.set("token", jwtRes.jwt);
    console.log(url.toString());
    // window.location.href = url.toString();
  }, [params]);

  const signIn = useCallback(async () => {
    if (state.account && state.nonce && platformSDK.current) {
      const message = new SiweMessage({
        domain: window.location.host,
        address: state.account.address,
        statement: "Sign in with Ledger",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce: state.nonce,
      });

      console.log({ message })

      try {
        const signature = await platformSDK.current.signMessage(
          state.account.id,
          Buffer.from(message.prepareMessage())
        );
        console.log("signing success: ", signature);

        const { data: verifyRes } = await axios.post<VerifyRequestResult>("/api/verify", { message, signature });

        if (!verifyRes.ok) {
          throw new Error(verifyRes.message);
        }

        setConnected(verifyRes.address);
        await redirectWithToken()
      } catch (error) {
        console.error("error signing: ", error);
        updateNonce();
      }
    }
  }, [state.account, state.nonce, updateNonce, redirectWithToken]);

  useEffect(() => {
    const sdk = new LedgerLivePlatformSDK(new WindowMessageTransport());
    sdk.connect();

    platformSDK.current = sdk;

    updateNonce();
  }, [updateNonce]);

  const handleRequestAccount = useCallback(async () => {
    if (!platformSDK.current) {
      return;
    }

    try {
      const account = await platformSDK.current.requestAccount({ currencies: ["ethereum"] })
      setState(oldState => ({
        ...oldState,
        account,
      }));
    } catch (error) {
      console.error(error)
    }
  }, []);

  const isReady = state.account && state.nonce;
  const isVerified = !!state.account && state.account.address.toLowerCase() === connectedAddress

  return (
    <>
      <Head>
        <title>Sign in with Ethereum</title>
        <meta
          name="description"
          content="Sign in using your Ethereum account"
        />
      </Head>
      <PageContainer>
        <OuterContainer>
          <InnerContainer>
            <WidgetHeader>
              <Text fontSize={4}>Sign in with Ethereum</Text>
            </WidgetHeader>
            <WidgetContent>
              <HeadingText>
                <Text variant="h1" fontSize={8}>
                  Sign in
                </Text>
              </HeadingText>
              <HeadingSubtext>
                <Text fontWeight="normal" fontSize={6}>
                  {`to continue to ${params.app.name}`}
                </Text>
              </HeadingSubtext>
              <Box mt={10}>
                <AccountSelector
                  isVerified={isVerified}
                  selectedAccount={state.account}
                  onRequestAccount={handleRequestAccount}
                />
              </Box>
              <Box mt={10}>
                <Text
                  fontSize={4}
                  lineHeight="1.4286"
                  fontWeight="normal"
                  color={"neutral.c80"} 
                >
                  {`To continue, Ledger will not share your ethereum address with
                  ${params.app.name}. Before using this app, you can review Referal
                  App’s privacy policy and Terms of Service.`}
                </Text>
              </Box>
              <Flex flexDirection="row" justifyContent="space-between" my={9}>
                <div></div>
                <Button variant="color" outline disabled={!isReady} onClick={isVerified ? redirectWithToken : signIn}>
                  <Text>Connect</Text>
                </Button>
              </Flex>
            </WidgetContent>
          </InnerContainer>
        </OuterContainer>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withIronSessionSsr(
  async ({ req, query }) => {
    const address = req.session.address;

    if (typeof query.appId !== "string") {
      return {
        notFound: true,
      }
    }

    const appConfig = appRegistry.find(app => app.id === query.appId);

    if (!appConfig) {
      return {
        notFound: true,
      }
    }

    const params: AuthParams = {
      app: {
        redirectURI: appConfig.redirect_uri,
        id: appConfig.id,
        name: appConfig.name,
      },
      state: typeof query.state === "string" ? query.state : null,
    }

    return {
      props: {
        connectedAddress: address || null,
        params,
      },
    };
  },
  ironOptions,
);

export default Home;
