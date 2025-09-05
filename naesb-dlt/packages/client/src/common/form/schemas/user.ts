import { object, string } from 'yup';

export const createUserSchema = object().shape({
  email: string()
    .notRequired()
    .matches(
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ),
  name: string().notRequired(),
  // given_name: string().notRequired(),
  // middle_name: string().notRequired(),
  // family_name: string().notRequired(),
  nickname: string().notRequired(),
  attention: string().notRequired(),
  base_contract_number: string().notRequired(),
  fax_number: string()
    .notRequired()
    .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/),
  im_carrier: string().notRequired(),
  im_id: string().notRequired(),
  phone_number: string()
    .notRequired()
    .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/),
});
