import { object, string } from 'yup';

export const createOrgSchema = object().shape({
  name: string().notRequired(),
  display_name: string().notRequired(),
  primary: string().notRequired(),
  page_background: string().notRequired(),
});

export const updateOrgSchema = object().shape({
  name: string().notRequired(),
  display_name: string().notRequired(),
  branding: object().shape({
    primary: string().notRequired(),
    page_background: string().notRequired(),
  }),
});
