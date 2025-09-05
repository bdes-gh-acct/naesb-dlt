import { IDirectory } from '@naesb/dlt-model';
import { ConnectionStepCard } from './ConnectionStepCard';
import { ChannelStepCard } from './ChannelStepCard';
import { BaseContractStep } from './BaseContractStep';

export interface SetupProps {
  directory: IDirectory;
}

export const Setup = ({ directory }: SetupProps) => {
  if (!directory.connection) {
    return <ConnectionStepCard directory={directory} />;
  }
  if (!directory?.channel || directory?.channel.NetworkStatus !== 'Active') {
    return <ChannelStepCard directory={directory} />;
  }
  return <BaseContractStep directory={directory as IDirectory} />;
};
