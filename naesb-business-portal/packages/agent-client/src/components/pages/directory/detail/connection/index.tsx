import {
  Box,
  Grid,
  Card,
  Typography,
  Divider,
  Alert,
  Button,
  Stack,
} from '@mui/joy';
import { useParams } from '@tanstack/router';
import { DisplayText } from 'components/shared/display';
import { useCreateConnection } from 'query/connections';
import { StepState } from 'components/shared/stepper/Step';
import { useBusiness } from 'query/directory';
import { BusinessRole } from '@naesb/dlt-model';
import { useCallback, useMemo } from 'react';
import { Stepper } from 'components/shared/stepper';
import { useOrgMsp } from 'utils/auth';
import { Setup } from './Setup';

export const BusinessRelationshipPage = () => {
  const { businessId } = useParams({
    from: '/Directory/$businessId/Relationship',
  });
  const { mutateAsync, isLoading: isConnecting } = useCreateConnection();

  const { data: directory, isLoading } = useBusiness(businessId);
  const { mspId } = useOrgMsp();
  const { data: myOrganization } = useBusiness(mspId);
  const handleClick = useCallback(() => {
    mutateAsync(directory?.did as string);
  }, [mutateAsync, directory]);
  const isFlowComplete = useMemo(() => {
    const hasConnection = directory?.connection?.state === 'active';
    const hasApprovedContract = Boolean(
      directory?.channel?.Contracts?.length &&
        directory?.channel?.Contracts[0]?.Approved,
    );
    const isCounterpartyTrader = Boolean(
      directory?.roles.find(
        (role) =>
          role.businessRoleId === BusinessRole.TRADER ||
          role.businessRoleId === BusinessRole.ADMIN,
      ),
    );
    const isTrader = Boolean(
      myOrganization?.roles.find(
        (role) =>
          role.businessRoleId === BusinessRole.TRADER ||
          role.businessRoleId === BusinessRole.ADMIN,
      ),
    );
    if (hasApprovedContract) return true;
    if (isCounterpartyTrader && isTrader) {
      return hasApprovedContract;
    }
    return hasConnection;
  }, [directory, myOrganization]);

  if (isLoading) return <></>;
  return (
    <>
      {!isFlowComplete ? (
        <>
          <Box pt={3} pb={3}>
            <Stepper
              value={
                !directory?.connection
                  ? 0
                  : directory.channel?.NetworkStatus === 'Active'
                  ? 2
                  : 1
              }
              items={[
                {
                  value: 0,
                  label: 'Connect',
                  state: directory?.connection
                    ? StepState.COMPLETED
                    : StepState.IN_PROGRESS,
                  complete: Boolean(directory?.connection),
                },
                {
                  value: 1,
                  label: 'Create Trade Channel',
                  complete: directory?.channel?.NetworkStatus === 'Active',
                  state:
                    directory?.channel?.NetworkStatus === 'Active'
                      ? StepState.COMPLETED
                      : directory?.channel?.Status || StepState.PENDING,
                },
                {
                  value: 2,
                  label: 'Base Contract',
                  state: StepState.PENDING,
                },
              ]}
            />
          </Box>
          {directory && <Setup directory={directory} />}
        </>
      ) : (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid xs={12} md={6}>
            <Card sx={{ paddingBottom: 0, paddingX: 0 }}>
              <Box mb={1} mx={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography level="title-md">Connection Info</Typography>
                  {!directory?.connection && !isLoading ? (
                    <Button
                      size="sm"
                      variant="outlined"
                      color="neutral"
                      disabled={!directory?.did || isConnecting}
                      onClick={handleClick}
                    >
                      Connect
                    </Button>
                  ) : undefined}
                </Box>
                <Divider sx={{ marginBottom: 1 }} />
                {!directory?.connection && !isLoading ? (
                  <Alert
                    color={!directory?.did ? 'warning' : 'primary'}
                    variant="outlined"
                  >
                    {!directory?.did
                      ? 'This business has no DID information configured'
                      : 'You are not connected to this business'}
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <DisplayText
                        label="Connection ID"
                        field="connection_id"
                        data={directory?.connection}
                        isLoading={isLoading}
                      />
                    </Box>
                    <Box>
                      <DisplayText
                        label="Their DID"
                        field="their_did"
                        data={directory?.connection}
                        isLoading={isLoading}
                      />
                    </Box>
                    <Box>
                      <DisplayText
                        label="Status"
                        field="state"
                        data={directory?.connection}
                        isLoading={isLoading}
                      />
                    </Box>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Card sx={{ paddingBottom: 0, paddingX: 0 }}>
              <Box mb={1} mx={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography level="title-md">Trading Info</Typography>
                </Box>
                <Divider sx={{ marginBottom: 1 }} />
                {!directory?.channel && !isLoading ? (
                  <Alert
                    color={
                      !directory?.roles?.find(
                        (role) => role.businessRoleId === 2,
                      )
                        ? 'warning'
                        : 'primary'
                    }
                    variant="outlined"
                  >
                    {!directory?.roles?.find(
                      (role) => role.businessRoleId === 2,
                    )
                      ? 'This business is not approved for trading'
                      : 'You do not have a trade channel with this business'}
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <DisplayText
                        label="Channel ID"
                        field="ChannelId"
                        data={directory?.channel}
                        isLoading={isLoading}
                      />
                    </Box>
                    <Box>
                      <DisplayText
                        label="Status"
                        field="Status"
                        data={directory?.channel}
                        isLoading={isLoading}
                        valueFormatter={({ data }) =>
                          data?.NetworkStatus || data.Status
                        }
                      />
                    </Box>
                    <Box>
                      <DisplayText
                        label="Base Contract"
                        field="BaseContract"
                        valueFormatter={({ data }) =>
                          data?.Contracts?.filter(
                            (contract) => contract.Approved,
                          )
                            .map((contract) => contract.Commodity)
                            .join(', ') || '--'
                        }
                        data={directory?.channel}
                        isLoading={isLoading}
                      />
                    </Box>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
};
