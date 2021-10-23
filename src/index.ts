import { Router } from 'itty-router';
import Posts from './classes/Posts';
import ValidationError from './classes/ValidationError';
import validateJson from './components/validateJson';
import validateParametersCheckMissing from './components/validateParametersCheckMissing';
import verifyPhotoUpload from './components/verifyPhotoUpload';
import uuidValidateV1 from './components/uuidValidateV1';

declare const POSTS: KVNamespace;

// Create a new router
const router = Router();

router.get('/posts', async () => {
  const listOfKeys = await POSTS.list();
  const listOfPosts = [];
  for (const key of listOfKeys.keys) {
    listOfPosts.push(await POSTS.get(key.name));
  }
  return new Response('[' + listOfPosts.toString() + ']');
});

router.get('/posts/:postId', async ({ params }) => {
  if (!params || !params.postId) {
    return new Response('No postId specified in request params', { status: 400 });
  } else {
    if (!uuidValidateV1(params.postId)) {
      return new Response('Invalid postId', { status: 400 });
    }
  }
  const post = await POSTS.get(params.postId);
  if (!post) {
    return new Response('No post found under that id', { status: 404 });
  }
  return new Response(post);
});

router.post('/posts', async (request: Request) => {
  try {
    const requestJson = await validateJson(request);
    if (!requestJson.photo) {
      requestJson.photo = '';
    } else {
      verifyPhotoUpload(requestJson.photo);
    }
    const validParams = ['title', 'userName', 'content', 'photo'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));
    const newPost = new Posts(
      requestJson.title,
      requestJson.userName,
      requestJson.content,
      requestJson.photo,
      [],
      [],
      [],
    );
    POSTS.put(newPost.getPostId(), newPost.toString());
    return new Response('Sucessfully created new post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).
Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all('*', () => new Response('404, not found!', { status: 404 }));

/*
This snippet ties our worker to the router we defined above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request));
});
