import { Alert, AlertProps, Typography } from '@mui/joy';
import { SnackbarContent, CustomContentProps } from 'notistack';
import { ReactNode, forwardRef } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import ReportIcon from '@mui/icons-material/Report';
import InfoIcon from '@mui/icons-material/Info';

const snackVariantMap: Record<
  string,
  { color: AlertProps['color']; icon: ReactNode; title: string }
> = {
  default: { color: 'primary', icon: <InfoIcon />, title: 'Info' },
  info: { color: 'primary', icon: <InfoIcon />, title: 'Info' },
  error: { color: 'danger', icon: <ReportIcon />, title: 'Error' },
  warning: { color: 'warning', icon: <WarningIcon />, title: 'Warning' },
  success: { color: 'success', icon: <CheckIcon />, title: 'Success' },
};

export const BaseSnackbar = forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => {
    const { message, variant, ...other } = props;
    return (
      // @ts-ignore
      <SnackbarContent ref={ref} role="alert" {...other}>
        <Alert
          startDecorator={snackVariantMap[variant].icon}
          color={snackVariantMap[variant].color}
          variant="outlined"
          sx={{ width: '100%' }}
        >
          <div>
            <div>{snackVariantMap[variant].title}</div>
            <Typography level="body-sm" color={snackVariantMap[variant].color}>
              {message}
            </Typography>
          </div>
        </Alert>
      </SnackbarContent>
    );
  },
);
