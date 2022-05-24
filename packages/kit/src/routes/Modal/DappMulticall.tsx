import React from 'react';

import { useIsVerticalLayout } from '@onekeyhq/components';
import ContractData from '@onekeyhq/kit/src/views/DappModals/ContractData';
import Multicall from '@onekeyhq/kit/src/views/DappModals/Multicall';
import TransactionEditFee from '@onekeyhq/kit/src/views/Send/SendEditFee';

import {
  DappMulticallModalRoutes,
  DappMulticallRoutesParams,
} from '../../views/DappModals/types';

import createStackNavigator from './createStackNavigator';

const DappMulticallModalNavigator =
  createStackNavigator<DappMulticallRoutesParams>();

const modalRoutes = [
  {
    name: DappMulticallModalRoutes.MulticallModal,
    component: Multicall,
  },
  {
    name: DappMulticallModalRoutes.EditFeeModal,
    component: TransactionEditFee,
  },
  {
    name: DappMulticallModalRoutes.ContractDataModal,
    component: ContractData,
  },
];

const DappMulticallStack = () => {
  const isVerticalLayout = useIsVerticalLayout();
  return (
    <DappMulticallModalNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: !!isVerticalLayout,
      }}
    >
      {modalRoutes.map((route) => (
        <DappMulticallModalNavigator.Screen
          key={route.name}
          name={route.name}
          component={route.component}
        />
      ))}
    </DappMulticallModalNavigator.Navigator>
  );
};

export default DappMulticallStack;
export type { DappMulticallRoutesParams };
export { DappMulticallModalRoutes };
