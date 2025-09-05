import * as React from 'react';
import { Container } from '@mui/joy';
import Form from '../components/registration/Form';
import Layout from '../components/layouts';

export default function Registration() {
  return (
    <Layout.Root>
      <Container maxWidth="sm">
        <Form />
      </Container>
    </Layout.Root>
  );
}
