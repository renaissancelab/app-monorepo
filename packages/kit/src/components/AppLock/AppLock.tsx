import React, { FC, useEffect } from 'react';

import { Box, OverlayContainer } from '@onekeyhq/components';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import { useAppSelector, useStatus } from '../../hooks/redux';
import { useDebounce } from '../../hooks';

import { AppStateHeartbeat } from './AppStateHeartbeat';
import { AppStateUnlock } from './AppStateUnlock';
import { AppStateUpdator } from './AppStateUpdator';

type AppLockProps = { children: JSX.Element };

export const AppLockOverlayMode: FC<AppLockProps> = ({ children }) => {
  const enableAppLock = useAppSelector((s) => s.settings.enableAppLock);
  const isPasswordSet = useAppSelector((s) => s.data.isPasswordSet);
  const isStatusUnlock = useAppSelector((s) => s.status.isUnlock);
  const isDataUnlock = useAppSelector((s) => s.data.isUnlock);

  const prerequisites = isPasswordSet && enableAppLock;
  const isUnlock = isDataUnlock && isStatusUnlock;
  return (
    <Box w="full" h="full">
      {prerequisites && !isUnlock ? (
        <OverlayContainer>
          <AppStateUnlock />
        </OverlayContainer>
      ) : null}
      {prerequisites && isUnlock ? <AppStateUpdator /> : null}
      {prerequisites && isUnlock ? <AppStateHeartbeat /> : null}
      {children}
    </Box>
  );
};

export const AppLockNormalMode: FC<AppLockProps> = ({ children }) => {
  const enableAppLock = useAppSelector((s) => s.settings.enableAppLock);
  const isPasswordSet = useAppSelector((s) => s.data.isPasswordSet);
  const isStatusUnlock = useAppSelector((s) => s.status.isUnlock);
  const isDataUnlock = useAppSelector((s) => s.data.isUnlock);

  const { enableAppLock: _enableAppLock, isPasswordSet: _isPasswordSet, isStatusUnlock: _isStatusUnlock, isDataUnlock: _isDataUnlock  } = useDebounce({ enableAppLock, isPasswordSet, isStatusUnlock, isDataUnlock }, 300)

  const prerequisites = _isPasswordSet && _enableAppLock;
  const isUnlock = _isDataUnlock && _isStatusUnlock;

  // const prerequisites = isPasswordSet && enableAppLock;
  // const isUnlock = isDataUnlock && isStatusUnlock;

  if (prerequisites && !isUnlock) {
    return <AppStateUnlock />;
  }
  return (
    <Box w="full" h="full">
      {children}
      {prerequisites && isUnlock ? <AppStateUpdator /> : null}
      {prerequisites && isUnlock ? <AppStateHeartbeat /> : null}
    </Box>
  );
};

export const AppLock: FC<AppLockProps> = ({ children }) => {
  if (platformEnv.isNative) {
    return <AppLockNormalMode>{children}</AppLockNormalMode>;
  }
  return <AppLockOverlayMode>{children}</AppLockOverlayMode>;
};
