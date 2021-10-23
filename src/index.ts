import { Router } from 'itty-router';
import Posts from './classes/Posts';
import requestPostId from './types/requestPostId';
import ValidationError from './classes/ValidationError';
import validateJson from './components/validateJson';
import validateParametersCheckMissing from './components/validateParametersCheckMissing';
import verifyPhotoUpload from './components/verifyPhotoUpload';
import uuidValidateV1 from './components/uuidValidateV1';

declare const POSTS: KVNamespace;

// Create a new router
const router = Router();

//get all posts
router.get('/posts', async () => {
  const listOfKeys = await POSTS.list();
  const listOfPosts = [];
  for (const key of listOfKeys.keys) {
    listOfPosts.push(await POSTS.get(key.name));
  }
  return new Response('[' + listOfPosts.toString() + ']');
});

//create posts
router.post('/posts', async (request) => {
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

//verify postId middleware
router.all('/posts/:postId', (request: requestPostId) => {
  if (!uuidValidateV1(request.params.postId)) {
    return new Response('Invalid postId', { status: 400 });
  }
});

//get post by postId
router.get('/posts/:postId', async (request: requestPostId) => {
  const post = await POSTS.get(request.params.postId);
  if (!post) {
    return new Response('No post found under that id', { status: 404 });
  }
  return new Response(post);
});

//upvote post
router.post('/posts/:postId/upvote', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);
    if (!requestJson.userName) {
      return new Response('Please include a userName as a parameter', { status: 404 });
    }
    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return new Response('No post found under that id', { status: 404 });
    }
    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      request.params.postId,
    );

    await post.addUpvote(requestJson.userName);
    return new Response('Sucessfully upvoted post!');
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
