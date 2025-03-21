import React from 'react';
import { BlockchainAction } from '../../interface/blockchainAction';
import { HttpAction } from '../../interface/httpAction';
import { TransferAction } from '../../interface/transferAction';
import { isBlockchainAction } from '../../utils/createMetadata';
import { isTransferAction, isHttpAction } from '../../utils/validator';
import BlockchainActionComponent from './BlockchainActionComponent';
import TransferActionComponent from './TransferActionComponent';
import HttpActionComponent from './HttpActionComponent';

interface ActionRendererProps {
  action: BlockchainAction | TransferAction | HttpAction;
}

export const ActionRenderer: React.FC<ActionRendererProps> = ({ action }) => {
  if (isBlockchainAction(action)) {
    return <BlockchainActionComponent action={action} />;
  } else if (isTransferAction(action)) {
    return <TransferActionComponent action={action} />;
  } else if (isHttpAction(action)) {
    return <HttpActionComponent action={action} />;
  }
  
  return <div>Unknown action type</div>;
};
