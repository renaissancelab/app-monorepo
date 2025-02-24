import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { useIsFocused } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import { StyleSheet } from 'react-native';

import {
  Box,
  Button,
  Center,
  Dialog,
  Icon,
  IconButton,
  PresenceTransition,
  Pressable,
  Spinner,
  Text,
  useIsVerticalLayout,
} from '@onekeyhq/components';
import {
  backupPlatform,
  logoutFromGoogleDrive,
} from '@onekeyhq/shared/src/cloudfs';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import backgroundApiProxy from '../../../../background/instance/backgroundApiProxy';
import { ValidationFields } from '../../../../components/Protected';
import { useNavigation } from '../../../../hooks';
import { useAppSelector, useData } from '../../../../hooks/redux';
import useAppNavigation from '../../../../hooks/useAppNavigation';
import useFormatDate from '../../../../hooks/useFormatDate';
import useLocalAuthenticationModal from '../../../../hooks/useLocalAuthenticationModal';
import {
  HomeRoutes,
  ModalRoutes,
  RootRoutes,
} from '../../../../routes/routesEnum';
import { incrBackupRequests } from '../../../../store/reducers/cloudBackup';
import { showOverlay } from '../../../../utils/overlayUtils';
import { PasswordRoutes } from '../../../Password/types';

import BackupIcon from './BackupIcon';
import Wrapper from './Wrapper';

import type {
  HomeRoutesParams,
  RootRoutesParams,
} from '../../../../routes/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProps = CompositeNavigationProp<
  NativeStackNavigationProp<RootRoutesParams, RootRoutes.Main>,
  NativeStackNavigationProp<
    HomeRoutesParams,
    HomeRoutes.CloudBackupPreviousBackups
  >
>;

const EnabledContent = ({
  lastBackup,
  inProgress,
}: {
  lastBackup: number;
  inProgress: boolean;
}) => {
  const intl = useIntl();
  const formatDate = useFormatDate();
  const { serviceCloudBackup, servicePassword, dispatch } = backgroundApiProxy;
  const { showVerify } = useLocalAuthenticationModal();

  const openDisableBackupDialog = useCallback(() => {
    showOverlay((onClose) => (
      <Dialog
        visible
        onClose={onClose}
        footerButtonProps={{
          primaryActionTranslationId: 'action__disable',
          secondaryActionTranslationId: 'action__dismiss',
          primaryActionProps: {
            type: 'destructive',
            onPromise: async () => {
              await serviceCloudBackup.disableService();
              onClose();
            },
          },
        }}
        contentProps={{
          iconName: 'CloudOutline',
          iconType: 'success',
          title: intl.formatMessage({
            id: 'dialog__your_wallets_are_backed_up',
          }),
          content: `${intl.formatMessage(
            {
              id: 'dialog__your_wallets_are_backed_up_desc',
            },
            {
              'cloudName': backupPlatform().cloudName,
              'platform': backupPlatform().platform,
            },
          )}\n\n${intl.formatMessage(
            {
              id: 'dialog__your_wallets_are_backed_up_desc_2',
            },
            { 'cloudName': backupPlatform().cloudName },
          )}`,
        }}
      />
    ));
  }, [intl, serviceCloudBackup]);

  const { isPasswordSet } = useData();
  const isFocused = useIsFocused();

  const navigation = useAppNavigation();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isFocused) {
      setIsLoading(false);
    }
  }, [isFocused]);
  const backUpAction = useCallback(async () => {
    setIsLoading(true);
    if (!isPasswordSet) {
      return new Promise((resolve) => {
        navigation.navigate(RootRoutes.Modal, {
          screen: ModalRoutes.Password,
          params: {
            screen: PasswordRoutes.PasswordRoutes,
            params: {
              onSuccess: () => {
                dispatch(incrBackupRequests());
                serviceCloudBackup.backupNow().then(() => {
                  resolve('');
                  setIsLoading(false);
                });
              },
            },
          },
        });
      });
    }
    const password = await servicePassword.getPassword();
    if (!password) {
      showVerify(
        () => {
          dispatch(incrBackupRequests());
          serviceCloudBackup.backupNow().then(() => {
            setIsLoading(false);
          });
        },
        () => {},
        null,
        ValidationFields.Secret,
      );
    }
    dispatch(incrBackupRequests());
    await serviceCloudBackup.backupNow();
    setIsLoading(false);
  }, [
    dispatch,
    isPasswordSet,
    navigation,
    serviceCloudBackup,
    servicePassword,
    showVerify,
  ]);

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" alignItems="center">
        {inProgress || isLoading ? (
          <Center rounded="full" size="12" bgColor="surface-neutral-subdued">
            <Spinner />
          </Center>
        ) : (
          <BackupIcon enabled />
        )}
        <Box px="16px" flex="1" justifyContent="center">
          {inProgress || isLoading ? (
            <>
              <Text typography="Body1Strong">
                {intl.formatMessage({
                  id: 'content__uploading_encrypted_backup',
                })}
              </Text>
              <Text typography="Body2" color="text-subdued">
                {intl.formatMessage({
                  id: 'content__uploading_encrypted_backup_desc',
                })}
              </Text>
            </>
          ) : (
            <>
              <Text typography="Body1Strong">
                {intl.formatMessage({ id: 'content__backup_enabled' })}
              </Text>
              {lastBackup > 0 ? (
                <Text mt={1} typography="Body2" color="text-subdued">
                  {formatDate.format(
                    new Date(lastBackup),
                    'MMM d, yyyy, HH:mm:ss',
                  )}
                </Text>
              ) : undefined}
            </>
          )}
        </Box>
        <IconButton
          type="plain"
          size="lg"
          name="EllipsisVerticalOutline"
          circle
          onPress={openDisableBackupDialog}
        />
      </Box>
      <Button
        size="xl"
        type="primary"
        mt="24px"
        isLoading={isLoading || inProgress}
        onPress={backUpAction}
      >
        {intl.formatMessage({ id: 'action__back_up_now' })}
      </Button>
    </Box>
  );
};

const DisabledContent = () => {
  const intl = useIntl();
  const isSmallScreen = useIsVerticalLayout();
  const { serviceCloudBackup } = backgroundApiProxy;

  return (
    <Box flexDirection={isSmallScreen ? 'column' : 'row'}>
      <Box flexDirection="row" alignItems="center" flex={1}>
        <BackupIcon enabled={false} />
        <Box pl="2" flex="1">
          <Text typography="Body1Strong">
            {intl.formatMessage({ id: 'content__backup_disabled' })}
          </Text>
          <Text typography="Body2" color="text-subdued">
            {intl.formatMessage(
              { id: 'content__backup_disabled_desc' },
              { 'cloudName': backupPlatform().cloudName },
            )}
          </Text>
        </Box>
      </Box>
      <Button
        onPress={() => {
          serviceCloudBackup.enableService();
        }}
        mt={{ base: 6, sm: 0 }}
        size={isSmallScreen ? 'xl' : 'base'}
        alignSelf="center"
        w={{ base: 'full', sm: 'auto' }}
      >
        {intl.formatMessage(
          { id: 'action__backup_to_icloud' },
          { 'cloudName': backupPlatform().cloudName },
        )}
      </Button>
    </Box>
  );
};

const PreviousBackupsContent = () => {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProps>();

  return (
    <>
      <Text typography="Body2" color="text-subdued" pb={2} mt={6}>
        {intl.formatMessage({ id: 'content__previous_backups_desc' })}
      </Text>
      <Box
        mt="1"
        borderRadius="12"
        background="surface-default"
        borderWidth={1}
        borderColor="border-subdued"
      >
        <Pressable
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          px={4}
          py={4}
          onPress={() => {
            navigation.navigate(HomeRoutes.CloudBackupPreviousBackups);
          }}
        >
          <Icon name="ClockOutline" size={24} />
          <Text typography="Body1Strong" flex="1" numberOfLines={1} px="3">
            {intl.formatMessage({ id: 'content__previous_backups' })}
          </Text>
          <Icon name="ChevronRightMini" color="icon-subdued" size={20} />
        </Pressable>
      </Box>
    </>
  );
};

const CloudBackup = () => {
  const intl = useIntl();
  const navigation = useNavigation();
  const { serviceCloudBackup } = backgroundApiProxy;

  useLayoutEffect(() => {
    const title = intl.formatMessage({ id: 'action__backup' });
    navigation.setOptions({
      title,
    });
  }, [navigation, intl]);

  const {
    isAvailable,
    enabled: backupEnabled,
    inProgress,
    lastBackup = 0,
  } = useAppSelector((s) => s.cloudBackup);
  const [hasPreviousBackups, setHasPreviousBackups] = useState(false);

  useEffect(() => {
    const getStatus = async () => {
      const status = await serviceCloudBackup.getBackupStatus();
      setHasPreviousBackups(status.hasPreviousBackups);
    };
    getStatus();
  }, [serviceCloudBackup]);

  return (
    <Wrapper>
      <Text typography="Heading" mb={4}>
        {backupPlatform().cloudName}
      </Text>
      {isAvailable ? (
        <Box>
          {backupEnabled ? (
            <EnabledContent lastBackup={lastBackup} inProgress={inProgress} />
          ) : (
            <DisabledContent />
          )}
          {hasPreviousBackups ? (
            <PresenceTransition
              visible={hasPreviousBackups}
              initial={{ opacity: 0, translateY: -8 }}
              animate={{
                opacity: 1,
                translateY: 0,
                transition: { duration: 150 },
              }}
            >
              <PreviousBackupsContent />
            </PresenceTransition>
          ) : undefined}
        </Box>
      ) : (
        <Text typography="Body2" color="text-critical">
          {intl.formatMessage(
            {
              id: 'content__log_in_icloud_to_enable_backup',
            },
            { 'cloudName': backupPlatform().cloudName },
          )}
        </Text>
      )}
      <Box w="full" py="6">
        <Box
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="divider"
        />
      </Box>
      <Text typography="Body2" color="text-subdued">
        {intl.formatMessage(
          { id: 'content__wont_backup' },
          { 'cloudName': backupPlatform().cloudName },
        )}
      </Text>
      <Text typography="Body2" color="text-subdued" />
      {platformEnv.isNativeAndroid && (
        <>
          <Box w="full">
            <Box
              borderBottomWidth={StyleSheet.hairlineWidth}
              borderBottomColor="divider"
            />
          </Box>
          <Button
            mt="6"
            onPress={() => {
              logoutFromGoogleDrive(false).then(() => {
                navigation.goBack();
              });
            }}
            size="xl"
          >
            {intl.formatMessage({ id: 'action__logout' })}
          </Button>
        </>
      )}
    </Wrapper>
  );
};

export default CloudBackup;
