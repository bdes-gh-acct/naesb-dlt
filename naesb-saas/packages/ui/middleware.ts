import {
  getSession,
  withMiddlewareAuthRequired,
} from '@auth0/nextjs-auth0/edge';
import { NextMiddleware, NextResponse } from 'next/server';

const { API_URL } = process.env;

const middleWare: NextMiddleware = async (req) => {
  const response = NextResponse.next();
  const session = await getSession(req, response);
  const token = session?.accessToken;
  const headers = new Headers();
  headers.append('accept', '*/*');
  headers.append('authorization', `Bearer ${token}`);
  const url = `${API_URL}/UserOrganizations/user`;
  const result = await (
    await fetch(url, {
      method: 'GET',
      headers,
    })
  ).json();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (
    !result.totalRecords &&
    req.nextUrl.pathname.toUpperCase() !== '/REGISTRATION'
  ) {
    const params = req.nextUrl.clone();
    params.pathname = '/registration';
    return NextResponse.redirect(params);
  }
  return NextResponse.next();
};

export default withMiddlewareAuthRequired(middleWare);

export const config = {
  matcher: ['/organizations/:path*', '/registration', '/account', '/locations'],
};
