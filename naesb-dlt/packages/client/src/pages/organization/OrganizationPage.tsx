import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganization, useUpdateOrganization } from '@query/organization';
import { PageContainer } from '@common/page';
import { AdminButtons } from '@pages/users/details/admin';
import { Box, Button, Card, Divider } from '@mui/material';
import { Error } from '@common/error/error';
import { Loading } from '@common/loading/Loading';
import { IOrganization } from '@naesb/dlt-model';
import { updateOrgSchema } from '@common/form/schemas/organizations';
import { Form } from '@common/form';
import SaveIcon from '@mui/icons-material/Save';

export interface IWithProps {
  editable: boolean;
  org: IOrganization;
  editHandler: () => void;
}

export function withOrganizationPage(Component: React.FC<IWithProps>) {
  return () => {
    const { user } = useAuth0();
    const { userId } = useParams<any>();
    const [editable, setEditable] = useState(false);

    const {
      data: organizationData,
      isLoading,
      isError,
      error,
    } = useOrganization();

    const {
      mutate,
      isLoading: isUpdating,
      isError: updateIsError,
      error: updateError,
      // @ts-ignore
    } = useUpdateOrganization(organizationData?.id);

    const isUserAdmin = () => {
      return user
        ? user[`${process.env.REACT_APP_AUTH0_NAMESPACE_ROLES}`]?.includes(
            'admin',
          )
        : false;
    };

    const canUserEdit = () => {
      return userId === user?.sub || isUserAdmin();
    };

    const setEditableFields = (fields: any) => {
      return {
        name: fields.name,
        display_name: fields.display_name,
        metadata: fields.metadata,
        branding: fields.branding,
      };
    };

    const handleUpdateOrg = (event: React.FormEvent<HTMLFormElement>) => {
      mutate(setEditableFields(event));
      setEditable(!editable);
    };

    if (isLoading || isUpdating) {
      return <Loading />;
    }

    if (isError || updateIsError) {
      return <Error message={error?.message || updateError?.message} />;
    }

    return (
      <PageContainer
        title="Organization"
        size="md"
        action={
          canUserEdit() ? (
            <AdminButtons
              toggleEdit={() => setEditable(!editable)}
              userIsAdmin={isUserAdmin()}
              editText="Edit Organization"
            />
          ) : (
            <></>
          )
        }
      >
        <Box mt={2}>
          <Card sx={{ padding: 2, marginTop: 2 }}>
            <Form
              schema={updateOrgSchema}
              onSubmit={handleUpdateOrg}
              initialValues={organizationData}
            >
              {organizationData ? (
                <Component
                  editable={editable}
                  org={organizationData}
                  editHandler={() => setEditable(!editable)}
                />
              ) : (
                <></>
              )}

              {editable ? (
                <>
                  <Divider />

                  <Button
                    startIcon={<SaveIcon />}
                    type="submit"
                    color="primary"
                    variant="contained"
                    aria-label="update user"
                    sx={{
                      marginTop: 2,
                      maxWidth: '105px',
                      padding: '6px 16px',
                    }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Form>
          </Card>
        </Box>
      </PageContainer>
    );
  };
}
