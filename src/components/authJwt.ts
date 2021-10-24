// Fetch GET Implementation
export default async function verifyJwt(userName: string): Promise<unknown> {
  // API Endpoint
  const url = `https://adipex-fraser-models-yugoslavia.trycloudflare.com/auth/${userName}`;
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
