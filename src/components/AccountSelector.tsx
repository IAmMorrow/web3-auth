import { Account } from "@ledgerhq/live-app-sdk";
import styled from "styled-components";
import Image from "next/image";
import { Button, Tag, Text } from "@ledgerhq/react-ui";

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AccountDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 600;
`;

const AccountIcon = styled.div`
  margin-right: 0.4em;
  flex-shrink: 0;
`;

const AccountName = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AccountSelectorProps = {
  onRequestAccount: () => void;
  selectedAccount: Account | null;
  isVerified: boolean;
};

export function AccountSelector({
  onRequestAccount,
  selectedAccount,
  isVerified,
}: AccountSelectorProps) {
  return (
    <Row>
      <AccountDisplay>
        {selectedAccount ? (
          <>
            <AccountIcon>
              <Image
                alt="crypto icon"
                src={`/icons/${selectedAccount.currency}.svg`}
                width={24}
                height={24}
              />
            </AccountIcon>
            <AccountName>{selectedAccount.name}</AccountName>
            {isVerified ? (
              <Tag ml={3} active type="opacity" size="small">
                Verified
              </Tag>
            ) : null}
          </>
        ) : null}
      </AccountDisplay>
      <Button onClick={onRequestAccount} size="small">
        <Text fontSize={3}>
          {selectedAccount ? "Change account" : "Select Account"}
        </Text>
      </Button>
    </Row>
  );
}
