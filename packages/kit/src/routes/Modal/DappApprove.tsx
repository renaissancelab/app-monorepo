import React from 'react';

import { useIsVerticalLayout } from '@onekeyhq/components';
import Approve from '@onekeyhq/kit/src/views/DappModals/Approve';
import ContractData from '@onekeyhq/kit/src/views/DappModals/ContractData';
import SpendLimitAmount from '@onekeyhq/kit/src/views/DappModals/SpendLimitAmount';
import TransactionEditFee from '@onekeyhq/kit/src/views/Send/SendEditFee';

import {
  DappApproveModalRoutes,
  DappApproveRoutesParams,
} from '../../views/DappModals/types';

import createStackNavigator from './createStackNavigator';

const DappApproveModalNavigator =
  createStackNavigator<DappApproveRoutesParams>();

const modalRoutes = [
  {
    name: DappApproveModalRoutes.ApproveModal,
    component: Approve,
  },
  {
    name: DappApproveModalRoutes.SpendLimitModal,
    component: SpendLimitAmount,
  },
  {
    name: DappApproveModalRoutes.EditFeeModal,
    component: TransactionEditFee,
  },
  {
    name: DappApproveModalRoutes.ContractDataModal,
    component: ContractData,
  },
];

const DappApproveStack = () => {
  const isVerticalLayout = useIsVerticalLayout();
  return (
    <DappApproveModalNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: !!isVerticalLayout,
      }}
    >
      {modalRoutes.map((route) => (
        <DappApproveModalNavigator.Screen
          key={route.name}
          name={route.name}
          component={route.component}
        />
      ))}
    </DappApproveModalNavigator.Navigator>
  );
};

export default DappApproveStack;
export type { DappApproveRoutesParams };
export { DappApproveModalRoutes };
