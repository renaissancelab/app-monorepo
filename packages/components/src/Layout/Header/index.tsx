import React, { FC, ReactNode } from 'react';

import { StyleSheet } from 'react-native';
import usePress from 'use-double-press';

import platformEnv from '@onekeyhq/shared/src/platformEnv';

import HStack from '../../HStack';
import Pressable from '../../Pressable';
import {
  useSafeAreaInsets,
  useThemeValue,
  useUserDevice,
} from '../../Provider/hooks';

type HeaderProps = {
  headerLeft: () => ReactNode;
  headerRight: () => ReactNode;
};

const DEFAULT_HEADER_VERTICAL = 57;
const DEFAULT_HEADER_HORIZONTAL = 65;

const Header: FC<HeaderProps> = ({ headerLeft, headerRight }) => {
  const insets = useSafeAreaInsets();
  const { size } = useUserDevice();
  const isHorizontal = ['LARGE', 'XLARGE'].includes(size);
  const pressHandler = usePress({
    onDoublePress: () => {
      if (platformEnv.isDesktop) window.desktopApi.toggleMaximizeWindow();
    },
    delay: 200,
  });

  const headerHeight = isHorizontal
    ? DEFAULT_HEADER_HORIZONTAL
    : DEFAULT_HEADER_VERTICAL;

  const [bgColor, borderColor] = useThemeValue([
    'surface-subdued',
    'border-subdued',
  ]);

  const headerLeftNode = headerLeft?.();

  return (
    <Pressable onPress={pressHandler}>
      <HStack
        height={`${headerHeight + insets.top}px`}
        pt={`${insets.top}px`}
        alignItems="center"
        justifyContent={isHorizontal ? 'flex-end' : 'space-between'}
        px={2}
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="0"
        borderBottomWidth={StyleSheet.hairlineWidth}
        style={{
          // @ts-expect-error
          '-webkit-app-region': 'drag',
          '-webkit-user-select': 'none',
        }}
      >
        {headerLeftNode ? (
          <HStack
            flex={isHorizontal ? undefined : 1}
            alignItems="center"
            h="full"
            pl={{ md: 2 }}
            pr={{ md: 4 }}
            flexShrink={0}
          >
            {headerLeftNode}
          </HStack>
        ) : null}

        {/* {isHorizontal && (
          <HStack alignItems="center" flex={1} pl={8}>
            <Typography.Heading>Home</Typography.Heading>
          </HStack>
        )} */}
        <HStack
          flex={isHorizontal ? undefined : 1}
          alignItems="center"
          justifyContent="flex-end"
          pr={{ md: 6 }}
        >
          {headerRight()}
        </HStack>
      </HStack>
    </Pressable>
  );
};

export default Header;
