// Fetch GET Implementation
// Gets JWT from authentication server
export default async function verifyJwt(userName: string): Promise<unknown> {
  // API Endpoint (Cloudflare Tunnel)
  const url = `https://lamp-itself-nsw-vocals.trycloudflare.com/auth/${userName}`;
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
