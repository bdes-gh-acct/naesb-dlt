import { Avatar, Typography, Grid, Skeleton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useUser } from '@query/users';
// @ts-ignore
import { useWidth } from '@react/toolkit';
import { get } from 'lodash';

interface IGridItem {
  title: string;
  path: string;
  xs: number;
  md?: number;
  itemStyle?: any;
}

export const ViewUser = () => {
  const { userId } = useParams<any>();
  const { data: user } = useUser(userId);
  const width = useWidth();

  const mobile = width === 'xs';

  const userInfoGridSection: IGridItem[] = [
    {
      title: 'User Id: ',
      path: 'identities.0.user_id',
      xs: 12,
    },
    { title: 'Name: ', path: 'name', xs: 12 },
    { title: 'Nick Name: ', path: 'nickname', xs: 12 },
  ];

  const contactInfoGridSection: IGridItem[] = [
    { title: 'Email: ', path: 'email', xs: 10, md: 4 },
    {
      title: 'Phone Number: ',
      path: 'user_metadata.phone_number',
      xs: 12,
      md: 4,
    },
    {
      title: 'Fax Number: ',
      path: 'user_metadata.fax_number',
      xs: 12,
      md: 4,
    },
    {
      title: 'IM Carrier: ',
      path: 'user_metadata.im_carrier',
      xs: 12,
      md: 4,
    },
    { title: 'IM Id: ', path: 'user_metadata.im_id', xs: 3, md: 4 },
  ];

  const renderGridSection = (gridItems: IGridItem[], gridFlex?: string) => {
    const returnGridItem = (innerGridItems: IGridItem[]) => {
      return innerGridItems.map((item) => {
        return (
          <Grid
            item
            xs={item.xs}
            md={item.md}
            key={`${item.title}`}
            sx={{ marginBottom: '20px' }}
          >
            <Typography gutterBottom variant="overline" color="textSecondary">
              {item.title}
            </Typography>
            <Typography>
              {user ? get(user, item.path) : <Skeleton />}
            </Typography>
          </Grid>
        );
      });
    };
    if (gridItems) {
      if (gridFlex && gridFlex === 'column') {
        return (
          <Grid container spacing={1}>
            {returnGridItem(gridItems)}
          </Grid>
        );
      }
      return (
        <Grid container spacing={1}>
          {returnGridItem(gridItems)}
        </Grid>
      );
    }
    return undefined;
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (isError) {
  //   console.log(error.message);
  //   return <Error message={error?.message} />;
  // }

  return (
    <Grid container spacing={3} direction={mobile ? 'row-reverse' : undefined}>
      <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
        <Typography variant="h5" component="h5">
          User Information
        </Typography>
        {renderGridSection(
          userInfoGridSection,
          `${!mobile ? 'column' : 'row'}`,
        )}
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
        order={{ xs: 1, md: 2 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Avatar
          alt="User profile image"
          src={user?.picture}
          sx={{ width: 200, height: 200 }}
        />
      </Grid>
      <Grid item xs={12} order={{ xs: 3, md: 3 }}>
        <Typography variant="h5">Contact Information</Typography>
        {renderGridSection(contactInfoGridSection)}
      </Grid>
    </Grid>
  );
};
