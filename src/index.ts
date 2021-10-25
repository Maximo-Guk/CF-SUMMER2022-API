import { Router } from 'itty-router';
import Users from './classes/Users';
import Posts from './classes/Posts';
import requestPostId from './types/requestPostId';
import requestCommentId from './types/requestCommentId';
import requestLocals from './types/requestLocals';
import ValidationError from './classes/ValidationError';
import validateJson from './components/validateJson';
import validateParametersCheckMissing from './components/validateParametersCheckMissing';
import verifyPhotoUpload from './components/verifyPhotoUpload';
import validateReactionType from './components/validateReactionType';
import uuidValidateV1 from './components/uuidValidateV1';
import authJwt from './components/authJwt';
import verifyJwt from './components/verifyJwt';

declare const POSTS: KVNamespace;
declare const USERS: KVNamespace;

// Create a new router
const router = Router();

//cors headers
function cors(response: Response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

//get all posts
router.get('/posts', async () => {
  const listOfKeys = await POSTS.list();
  const listOfPosts = [];
  for (const key of listOfKeys.keys) {
    listOfPosts.push(await POSTS.get(key.name));
  }
  return cors(new Response('[' + listOfPosts.toString() + ']'));
});

//register user
router.get('/users/:userName', async (request) => {
  if (request.params && request.params.userName) {
    const storedUser = await USERS.get(request.params.userName);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const user = new Users(parsedUser.userName, parsedUser.avatarBackgroundColor);
      return cors(new Response(user.toString()));
    } else {
      const authResponse: any = await authJwt(request.params.userName);
      const cookie = authResponse.headers.get('set-cookie');

      const user = new Users(request.params.userName);
      USERS.put(request.params.userName, user.toString());

      const response = new Response('User has been registered!');
      response.headers.set('set-cookie', cookie);
      return cors(response);
    }
  } else {
    return cors(new Response('Please include a userName in parameters', { status: 400 }));
  }
});

//verify postId middleware
router.all('/posts/:postId', (request: requestPostId) => {
  if (!uuidValidateV1(request.params.postId)) {
    return cors(new Response('Invalid postId', { status: 400 }));
  }
});

//get post by postId
router.get('/posts/:postId', async (request: requestPostId) => {
  const post = await POSTS.get(request.params.postId);
  if (!post) {
    return cors(new Response('No post found under that id', { status: 404 }));
  }
  return cors(new Response(post));
});

//verify jwt token
router.all('*', async (request: any) => {
  try {
    if (request.headers.get('Cookie')) {
      const cookie = request.headers.get('Cookie');
      const jwtToken = cookie.split('token=')[1];
      const verificationResponse: any = await verifyJwt(jwtToken);
      request.locals = verificationResponse;
    } else {
      return cors(new Response('Missing authentication header!'));
    }
  } catch (error) {
    return cors(new Response('Invalid Token!'));
  }
});

//verify user
router.get('/verify', async (request: requestLocals) => {
  return cors(new Response(JSON.stringify({ userName: request.locals.userName })));
});

//logout user
router.get('/users/:userName/logout', async (request: any) => {
  const cookie = request.headers.get('Cookie');
  const response = new Response('Sucessfully logged out!');
  response.headers.set('set-cookie', `${cookie}; max-age=0; Path=/;`);
  return cors(response);
});

//create posts
router.post('/posts', async (request: requestLocals) => {
  try {
    const requestJson = await validateJson(request);

    if (!requestJson.photo) {
      requestJson.photo = '';
    } else {
      verifyPhotoUpload(requestJson.photo);
    }

    const storedUser = await USERS.get(request.locals.userName);
    if (!storedUser) {
      return cors(new Response('No user with that userName found', { status: 404 }));
    }
    const parsedUser = JSON.parse(storedUser);
    const user = new Users(parsedUser.userName, parsedUser.avatarBackgroundColor);

    const validParams = ['title', 'content', 'photo'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

    const newPost = new Posts(
      requestJson.title,
      request.locals.userName,
      user.getAvatarBackgroundColor(),
      requestJson.content,
      requestJson.photo,
      [],
      {
        '😀': [],
        '😂': [],
        '😭': [],
        '🥰': [],
        '😍': [],
        '🤢': [],
      },
      [],
      Date.now().toString(),
    );

    POSTS.put(newPost.getPostId(), newPost.toString());
    return cors(new Response('Sucessfully created new post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//delete post by postId
router.delete('/posts/:postId', async (request: requestPostId) => {
  const storedPost = await POSTS.get(request.params.postId);
  if (!storedPost) {
    return cors(new Response('No post found under that id', { status: 404 }));
  }

  const parsedPost = JSON.parse(storedPost);
  const post = new Posts(
    parsedPost.title,
    parsedPost.userName,
    parsedPost.userBackgroundColor,
    parsedPost.content,
    parsedPost.photo,
    parsedPost.upVotes,
    parsedPost.reactions,
    parsedPost.comments,
    parsedPost.createdAt,
    request.params.postId,
  );

  if (request.locals.userName === post.getUserName()) {
    await POSTS.delete(request.params.postId);
    return cors(new Response('Sucessfully deleted post!'));
  } else {
    return cors(new Response("You can't delete posts you don't own!"));
  }
});

//upvote post
router.post('/posts/:postId/upvote', async (request: requestPostId) => {
  try {
    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.addUpvote(request.locals.userName);
    return cors(new Response('Sucessfully upvoted post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//remove upvote post
router.delete('/posts/:postId/upvote', async (request: requestPostId) => {
  try {
    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.removeUpvote(request.locals.userName);
    return cors(new Response('Sucessfully removed upvote on post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//react to post
router.post('/posts/:postId/react', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['type'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

    const reactionType = requestJson.type.split(/(?!$)/u)[0];
    validateReactionType(reactionType);

    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.addReaction(request.locals.userName, reactionType);
    return cors(new Response('Sucessfully reacted to post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//remove reaction to post
router.delete('/posts/:postId/react', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['type'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

    const reactionType = requestJson.type.split(/(?!$)/u)[0];
    validateReactionType(reactionType);

    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.removeReaction(request.locals.userName, reactionType);
    return cors(new Response('Sucessfully removed reaction from post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//comment on post
router.post('/posts/:postId/comments', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['content'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.addComment(request.locals.userName, requestJson.content);
    return cors(new Response('Sucessfully commented on post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//verify postId middleware
router.all('/posts/:postId/comments/:commentId', (request: requestCommentId) => {
  if (!uuidValidateV1(request.params.commentId)) {
    return cors(new Response('Invalid commentId', { status: 400 }));
  }
});

//delete post comment by commentId
router.delete('/posts/:postId/comments/:commentId', async (request: requestCommentId) => {
  try {
    const storedPost = await POSTS.get(request.params.postId);
    if (!storedPost) {
      return cors(new Response('No post found under that id', { status: 404 }));
    }

    const parsedPost = JSON.parse(storedPost);
    const post = new Posts(
      parsedPost.title,
      parsedPost.userName,
      parsedPost.userBackgroundColor,
      parsedPost.content,
      parsedPost.photo,
      parsedPost.upVotes,
      parsedPost.reactions,
      parsedPost.comments,
      parsedPost.createdAt,
      request.params.postId,
    );

    await post.removeComment(request.locals.userName, request.params.commentId);
    return cors(new Response('Sucessfully deleted comment on post!'));
  } catch (error) {
    if (error instanceof ValidationError) {
      return cors(new Response(error.message, { status: error.code }));
    }
  }
});

//upvote comment by commentId
router.post(
  '/posts/:postId/comments/:commentId/upvote',
  async (request: requestCommentId) => {
    try {
      const storedPost = await POSTS.get(request.params.postId);
      if (!storedPost) {
        return cors(new Response('No post found under that id', { status: 404 }));
      }

      const parsedPost = JSON.parse(storedPost);
      const post = new Posts(
        parsedPost.title,
        parsedPost.userName,
        parsedPost.userBackgroundColor,
        parsedPost.content,
        parsedPost.photo,
        parsedPost.upVotes,
        parsedPost.reactions,
        parsedPost.comments,
        parsedPost.createdAt,
        request.params.postId,
      );

      await post.addCommentUpVote(request.locals.userName, request.params.commentId);
      return cors(new Response('Sucessfully upvoted commented!'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return cors(new Response(error.message, { status: error.code }));
      }
    }
  },
);

//remove comment upvote by commentId
router.delete(
  '/posts/:postId/comments/:commentId/upvote',
  async (request: requestCommentId) => {
    try {
      const storedPost = await POSTS.get(request.params.postId);
      if (!storedPost) {
        return cors(new Response('No post found under that id', { status: 404 }));
      }

      const parsedPost = JSON.parse(storedPost);
      const post = new Posts(
        parsedPost.title,
        parsedPost.userName,
        parsedPost.userBackgroundColor,
        parsedPost.content,
        parsedPost.photo,
        parsedPost.upVotes,
        parsedPost.reactions,
        parsedPost.comments,
        parsedPost.createdAt,
        request.params.postId,
      );

      await post.removeCommentUpVote(request.locals.userName, request.params.commentId);
      return cors(new Response('Sucessfully removed upvote on comment!'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return cors(new Response(error.message, { status: error.code }));
      }
    }
  },
);

//react to comment by commentId
router.post(
  '/posts/:postId/comments/:commentId/react',
  async (request: requestCommentId) => {
    try {
      const requestJson = await validateJson(request);

      const validParams = ['type'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

      const reactionType = requestJson.type.split(/(?!$)/u)[0];
      validateReactionType(reactionType);

      const storedPost = await POSTS.get(request.params.postId);
      if (!storedPost) {
        return cors(new Response('No post found under that id', { status: 404 }));
      }

      const parsedPost = JSON.parse(storedPost);
      const post = new Posts(
        parsedPost.title,
        parsedPost.userName,
        parsedPost.userBackgroundColor,
        parsedPost.content,
        parsedPost.photo,
        parsedPost.upVotes,
        parsedPost.reactions,
        parsedPost.comments,
        parsedPost.createdAt,
        request.params.postId,
      );

      await post.addCommentReaction(
        request.locals.userName,
        request.params.commentId,
        reactionType,
      );
      return cors(new Response('Sucessfully reacted to comment!'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return cors(new Response(error.message, { status: error.code }));
      }
    }
  },
);

//remove reaction to comment by commentId
router.delete(
  '/posts/:postId/comments/:commentId/react',
  async (request: requestCommentId) => {
    try {
      const requestJson = await validateJson(request);

      const validParams = ['type'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

      const reactionType = requestJson.type.split(/(?!$)/u)[0];
      validateReactionType(reactionType);

      const storedPost = await POSTS.get(request.params.postId);
      if (!storedPost) {
        return cors(new Response('No post found under that id', { status: 404 }));
      }

      const parsedPost = JSON.parse(storedPost);
      const post = new Posts(
        parsedPost.title,
        parsedPost.userName,
        parsedPost.userBackgroundColor,
        parsedPost.content,
        parsedPost.photo,
        parsedPost.upVotes,
        parsedPost.reactions,
        parsedPost.comments,
        parsedPost.createdAt,
        request.params.postId,
      );

      await post.removeCommentReaction(
        request.locals.userName,
        request.params.commentId,
        reactionType,
      );
      return cors(new Response('Sucessfully removed reaction from comment!'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return cors(new Response(error.message, { status: error.code }));
      }
    }
  },
);

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).
Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all('*', () => cors(new Response('404, not found!', { status: 404 })));

/*
This snippet ties our worker to the router we defined above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request));
});
