import { Box, BoxProps } from '@mui/joy';
import useScrollTrigger from '@mui/material/useScrollTrigger';

const Root = ({ sx, ...props }: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        paddingY: 2,
        paddingX: 2,
        height: 'calc(100vh - 87px)',
        marginTop: '87px',
      },

      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);

const Header = ({ sx, ...props }: BoxProps) => {
  const trigger = useScrollTrigger({ threshold: 0 });
  return (
    <Box
      component="header"
      className="Header"
      {...props}
      sx={[
        {
          p: 2,
          gap: 2,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: trigger ? 'rgba(0,0,0,1)' : 'none',
          transition: 'background-color 200ms ease-in-out',
          alignItems: 'center',
          gridColumn: '1 / -1',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 1100,
        },

        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};

export default { Root, Header };
