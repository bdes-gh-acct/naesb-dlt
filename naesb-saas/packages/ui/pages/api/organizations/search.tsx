import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const { API_URL } = process.env;

const getOrganizations = async (
  req: NextApiRequest,
  res: NextApiResponse,
  accessToken: string,
) => {
  try {
    const response = await axios.post(
      `${API_URL}/organizations/search`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const organizations = response.data;
    res.status(200).json(organizations);
  } catch (e) {
    const error = e as AxiosError;
    res.status(error.response?.status || 500).json(error.response?.data);
  }
};

export default withApiAuthRequired(async (req, res) => {
  // If your access token is expired and you have a refresh token
  // `getAccessToken` will fetch you a new one using the `refresh_token` grant
  const { accessToken } = await getAccessToken(req, res);
  switch (req.method) {
    case 'POST':
      await getOrganizations(req, res, accessToken as string);
      break;
    default:
      res.status(404).end();
  }
});
