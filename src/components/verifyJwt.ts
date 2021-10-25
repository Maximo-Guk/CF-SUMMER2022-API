// Fetch GET Implementation
export default async function verifyJwt(idToken: string): Promise<unknown> {
  // API Endpoint
  const url = 'https://lamp-itself-nsw-vocals.trycloudflare.com/verify';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Cookie: `token=${idToken}; Path=/;`,
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw response;
  }
}
