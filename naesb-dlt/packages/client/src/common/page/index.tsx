import {
  Box,
  Container,
  ContainerProps,
  styled,
  Typography,
} from '@mui/material';
import { FC, ReactNode, useState } from 'react';
// @ts-ignore
import { useWidth } from '@react/toolkit';
import { drawerWidth, SideNav } from '@common/header/nav/sidenav/SideNav';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { isScreenSmall } from '@common/utils';
import { Breadcrumbs, BreadcrumbsProps } from './BreadCrumbs';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ open }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: '64px',
  paddingBottom: 3,
  // transition: theme.transitions.create('margin', {
  //   easing: theme.transitions.easing.sharp,
  //   duration: theme.transitions.duration.leavingScreen,
  // }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    // transition: theme.transitions.create('margin', {
    //   easing: theme.transitions.easing.easeOut,
    //   duration: theme.transitions.duration.enteringScreen,
    // }),
    marginLeft: 0,
  }),
}));

export interface PageContainerProps {
  // eslint-disable-next-line react/no-unused-prop-types
  size?: ContainerProps['maxWidth'];
  breadcrumbs?: BreadcrumbsProps['items'];
  title?: string;
  action?: ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({
  action,
  breadcrumbs,
  children,
  title,
}) => {
  const currentWidth = useWidth();
  const mobile = isScreenSmall(currentWidth);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerDirty] = useState(false);

  const toggleMenu = () => {
    setIsDrawerOpen(!isDrawerOpen);
    // setDrawerDirty(true);
  };

  return (
    <Box display="flex" flexGrow={1} height="100%">
      <SideNav
        isOpen={!mobile && isDrawerOpen}
        toggleMenu={toggleMenu}
        drawerDirty={drawerDirty}
      />
      <Main open={!mobile && isDrawerOpen}>
        <Container
          maxWidth={false}
          sx={{
            marginTop: '20px',
            height: '100%',
            flexGrow: 1,
            paddingBottom: 2,
          }}
        >
          {mobile ? (
            <></>
          ) : (
            <MenuOutlinedIcon
              sx={{ color: '#fff', justifySelf: 'flex-end' }}
              onClick={toggleMenu}
            />
          )}

          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mt={1}
            mb={3}
          >
            <Typography variant="h4">{title}</Typography>
            {action && <Box>{action}</Box>}
          </Box>
          {children}
        </Container>
      </Main>
    </Box>
  );
};
