/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import {
  Form as FinalForm,
  FormProps as FinalFormFormProps,
  AnyObject,
  FormRenderProps,
} from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { AnySchema } from 'yup';
import { useValidationSchema } from './useValidationSchema';

export * from './Submit';
export * from './useDisableSubmit';

export interface FormProps<T>
  extends Omit<FinalFormFormProps<T>, 'validate' | 'render'> {
  /**
   * Provide a yup schema to validate the form.
   */
  schema?: AnySchema<T>;
  context?: any;
}

const defaultValidate = () => {};

export const Form: React.FC<FormProps<AnyObject>> = ({
  children,
  schema,
  context,
  validate: propsValidate = defaultValidate,
  ...props
}) => {
  const validate = useValidationSchema<AnyObject>(schema, context);
  const renderForm = ({ handleSubmit }: FormRenderProps<AnyObject>) => (
    <form onSubmit={handleSubmit}>{children}</form>
  );

  return (
    // @ts-ignore mutators should be included in props
    <FinalForm
      {...props}
      render={renderForm}
      mutators={{
        ...arrayMutators,
      }}
      validate={
        schema
          ? async (values) => {
              const validationResponse = await validate(values);
              return validationResponse;
            }
          : propsValidate
      }
    />
  );
};
