import React, { useCallback, useEffect, useMemo } from 'react';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { useIntl } from 'react-intl';

import {
  Box,
  Center,
  Icon,
  Image,
  KeyboardDismissView,
  Modal,
  Typography,
  useToast,
} from '@onekeyhq/components';
import { ModalProps } from '@onekeyhq/components/src/Modal';
import { Text } from '@onekeyhq/components/src/Typography';

import backgroundApiProxy from '../../background/instance/backgroundApiProxy';
import { WatchAssetParameters } from '../../background/providers/ProviderApiEthereum';
import { useManageTokens } from '../../hooks';
import { useActiveWalletAccount } from '../../hooks/redux';

import { ManageTokenRoutes, ManageTokenRoutesParams } from './types';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RouteProps = RouteProp<
  ManageTokenRoutesParams,
  ManageTokenRoutes.AddToken
>;

type NavigationProps = NativeStackNavigationProp<
  ManageTokenRoutesParams,
  ManageTokenRoutes.AddToken
>;

type ListItem = { label: string; value: string };

export type IViewTokenModalProps = ModalProps;

const useRouteParams = () => {
  const routeProps = useRoute<RouteProps>();
  const { params } = routeProps;
  if ('query' in params) {
    const query: WatchAssetParameters = JSON.parse(params.query);
    const { address, symbol, decimals, image } = query.options;
    return {
      name: '',
      address,
      symbol: symbol ?? '',
      decimal: decimals ?? 0,
      logoURI: image ?? '',
    };
  }
  return params;
};

function ViewTokenModal(props: IViewTokenModalProps) {
  const { balances } = useManageTokens();
  const { account: activeAccount, network: activeNetwork } =
    useActiveWalletAccount();
  const intl = useIntl();
  const { name, symbol, decimal, address, logoURI } = useRouteParams();
  const items: ListItem[] = useMemo(() => {
    const data = [
      {
        label: intl.formatMessage({
          id: 'form__name',
          defaultMessage: 'Name',
        }),
        value: name,
      },
      {
        label: intl.formatMessage({
          id: 'form__symbol',
          defaultMessage: 'Symbol',
        }),
        value: symbol,
      },
      {
        label: intl.formatMessage({
          id: 'form__contract',
          defaultMessage: 'Contact',
        }),
        value: address,
      },
      {
        label: intl.formatMessage({
          id: 'form__decimal',
          defaultMessage: 'Decimal',
        }),
        value: String(decimal),
      },
    ].filter(({ value }) => !!value);

    if (balances[address]) {
      data.push({
        label: intl.formatMessage({
          id: 'content__balance',
          defaultMessage: 'Balance',
        }),
        value: balances[address] ?? '0',
      });
    }
    return data;
  }, [name, symbol, address, decimal, balances, intl]);
  useEffect(() => {
    async function fetchBalance() {
      if (activeAccount && activeNetwork) {
        await backgroundApiProxy.serviceToken.fetchTokenBalance([address]);
      }
    }
    fetchBalance();
  }, [activeAccount, activeNetwork, address]);
  return (
    <Modal
      height="560px"
      footer={null}
      scrollViewProps={{
        children: (
          <KeyboardDismissView>
            <Box>
              <Box
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mb="8"
                mt="6"
              >
                <Image
                  src={logoURI}
                  alt="logoURI"
                  size="56px"
                  borderRadius="full"
                  fallbackElement={
                    <Center
                      w="56px"
                      h="56px"
                      rounded="full"
                      bgColor="surface-neutral-default"
                    >
                      <Icon size={32} name="QuestionMarkOutline" />
                    </Center>
                  }
                />
                <Typography.PageHeading mt="4">{`${intl.formatMessage({
                  id: 'title__adding_str' as any,
                  defaultMessage: 'Adding',
                })} ${symbol}`}</Typography.PageHeading>
              </Box>
              <Box bg="surface-default" borderRadius="12" mt="2" mb="3">
                {items.map((item, index) => (
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    p="4"
                    alignItems="center"
                    key={index}
                    borderTopRadius={index === 0 ? '12' : undefined}
                    borderBottomRadius={
                      index === items.length - 1 ? '12' : undefined
                    }
                    borderTopColor="divider"
                    borderTopWidth={index !== 0 ? '1' : undefined}
                  >
                    <Text
                      typography={{ sm: 'Body1Strong', md: 'Body2Strong' }}
                      color="text-subdued"
                    >
                      {item.label}
                    </Text>
                    <Text
                      typography={{ sm: 'Body1Strong', md: 'Body2Strong' }}
                      maxW="56"
                      textAlign="right"
                    >
                      {item.value}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </KeyboardDismissView>
        ),
      }}
      {...props}
    />
  );
}

function AddTokenModal() {
  const toast = useToast();
  const { account: activeAccount, network: activeNetwork } =
    useActiveWalletAccount();
  const navigation = useNavigation<NavigationProps>();
  const intl = useIntl();
  const { address } = useRouteParams();

  const onPrimaryActionPress = useCallback(async () => {
    if (activeAccount && activeNetwork) {
      await backgroundApiProxy.engine.quickAddToken(
        activeAccount.id,
        activeNetwork.id,
        address,
      );
      toast.show({
        title: intl.formatMessage({
          id: 'msg__token_added',
          defaultMessage: 'Token Added',
        }),
      });
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [intl, activeAccount, navigation, activeNetwork, toast, address]);

  return (
    <ViewTokenModal
      footer
      hideSecondaryAction
      primaryActionTranslationId="action__confirm"
      primaryActionProps={{
        onPromise: onPrimaryActionPress,
      }}
    />
  );
}

export { ViewTokenModal, AddTokenModal };
export const AddToken = AddTokenModal;
export default AddToken;
