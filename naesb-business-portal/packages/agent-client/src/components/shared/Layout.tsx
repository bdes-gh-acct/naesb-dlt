/* eslint-disable react/destructuring-assignment */
import { Box, BoxProps, Sheet } from '@mui/joy';

const Root = ({ sx, ...props }: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(64px, 200px) minmax(450px, 1fr)',
          md: 'minmax(160px, 300px) minmax(300px, 1fr)',
        },
        gridTemplateRows: '64px 1fr',
        bgcolor: 'background.appBody',
        minHeight: '100vh',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

const Header = ({ sx, ...props }: BoxProps) => (
  <Box
    component="header"
    className="Header"
    {...props}
    sx={[
      {
        paddingX: 2,
        paddingY: 0.5,
        gap: 2,
        bgcolor: 'background.surface',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gridColumn: '1 / -1',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

const SideNav = (props: BoxProps) => {
  return (
    <Box
      component="nav"
      className="Navigation"
      {...props}
      sx={[
        {
          px: 1,
          bgcolor: 'background.surface',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: {
            xs: 'none',
            sm: 'initial',
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
};

const SidePane = (props: BoxProps) => {
  return (
    <Box
      className="Inbox"
      {...props}
      sx={[
        {
          bgcolor: 'background.surface',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: {
            xs: 'none',
            md: 'initial',
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
};

const Main = (props: BoxProps) => {
  return (
    <Box
      component="main"
      className="Main"
      {...props}
      sx={[
        { px: 2, pb: 2 },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
};

const SideDrawer = ({
  onClose,
  ...props
}: BoxProps & { onClose: React.MouseEventHandler<HTMLDivElement> }) => {
  return (
    <Box
      {...props}
      sx={[
        { position: 'fixed', zIndex: 1200, width: '100%', height: '100%' },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Box
        role="button"
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: (theme) =>
            `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
        }}
      />
      <Sheet
        sx={{
          minWidth: 256,
          width: 'max-content',
          height: '100%',
          p: 2,
          boxShadow: 'lg',
          bgcolor: 'background.surface',
        }}
      >
        {props.children}
      </Sheet>
    </Box>
  );
};

export default { Root, Header, SideNav, SidePane, SideDrawer, Main };
