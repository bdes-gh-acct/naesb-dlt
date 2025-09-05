/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Typography, useTheme } from '@mui/joy';
import { ReactNode } from 'react';
import CheckIcon from '@mui/icons-material/Check';

export enum StepState {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  ERROR = 'Error',
  IN_PROGRESS = 'In Progress',
}

export interface StepProps {
  label: ReactNode;
  value: string | number;
  description?: string;
  complete?: boolean;
  state: string;
}

export const Step = ({
  label,
  value,
  state,
  description,
  itemIndex,
  active,
  complete,
}: StepProps & { itemIndex: number; active: boolean }) => {
  const innerTheme = useTheme();
  return (
    <Box paddingLeft={2} paddingRight={2} flex="1 1 0%" position="relative">
      {Boolean(itemIndex) && (
        <Box
          sx={{
            flex: '1 1 auto',
            position: 'absolute',
            top: '20px',
            left: 'calc(-50% + 34px)',
            right: 'calc(50% + 34px)',
          }}
        >
          <span
            style={{
              display: 'block',
              borderTopStyle: 'solid',
              borderTopWidth: '1px',
              borderColor:
                active || complete
                  ? innerTheme.palette.primary[500]
                  : innerTheme.palette.neutral[500],
            }}
          />
        </Box>
      )}
      <Box flexDirection="column" display="flex" alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            border: '2px solid',
            borderRadius: '50%',
            borderColor: (theme) =>
              active || complete
                ? theme.palette.primary[500]
                : theme.palette.neutral[500],
            marginBottom: 1,
          }}
        >
          {complete ? (
            <CheckIcon color="success" />
          ) : (
            <Typography level="title-lg">{itemIndex + 1}</Typography>
          )}
        </Box>
        <Typography
          level="title-md"
          sx={{
            color: (theme) =>
              active
                ? theme.palette.text.primary
                : theme.palette.text.secondary,
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            level="body-sm"
            sx={{
              color: (theme) =>
                active
                  ? theme.palette.text.secondary
                  : theme.palette.text.tertiary,
            }}
          >
            {description}
          </Typography>
        )}
        {state && (
          <Typography level="body-sm" fontSize={12}>
            {state}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
