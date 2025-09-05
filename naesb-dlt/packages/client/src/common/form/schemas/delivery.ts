import { object, string, number } from 'yup';

export const createDeliverySchema = object().shape({
  Date: string()
    .required()
    .matches(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/,
    ),
  TspDeliveryId: string().required(),
  ChannelId: string().required(),
  DeliveryLocation: string().required(),
  NominatedQuantity: number().required(),
  ServiceRequestorParty: string().required(),
  TspBusinessId: number().required(),
});
