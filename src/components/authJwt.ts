// Fetch GET Implementation
export default async function verifyJwt(userName: string): Promise<unknown> {
  // API Endpoint
  const url = `https://march-sc-choose-email.trycloudflare.com/auth/${userName}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    redirect: 'follow',
  });
  if (response.ok) {
    return response;
  } else {
    throw response;
  }
}
