import { Router } from 'itty-router';
import Posts from './classes/Posts';
import requestPostId from './types/requestPostId';
import requestCommentId from './types/requestCommentId';
import ValidationError from './classes/ValidationError';
import validateJson from './components/validateJson';
import validateParametersCheckMissing from './components/validateParametersCheckMissing';
import verifyPhotoUpload from './components/verifyPhotoUpload';
import validateReactionType from './components/validateReactionType';
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

    const validParams = ['userName'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

//remove upvote post
router.delete('/posts/:postId/upvote', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['userName'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

    await post.removeUpvote(requestJson.userName);
    return new Response('Sucessfully removed upvote on post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

//react to post
router.post('/posts/:postId/react', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['userName', 'type'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

    const reactionType = requestJson.type.split(/(?!$)/u)[0];
    validateReactionType(reactionType);

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

    await post.addReaction(requestJson.userName, reactionType);
    return new Response('Sucessfully upvoted post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

//remove reaction to post
router.delete('/posts/:postId/react', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['userName'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

    await post.removeReaction(requestJson.userName);
    return new Response('Sucessfully removed reaction from post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

//comment on post
router.post('/posts/:postId/comments', async (request: requestPostId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['userName', 'content'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

    await post.addComment(requestJson.userName, requestJson.content);
    return new Response('Sucessfully commented on post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

//verify postId middleware
router.all('/posts/:postId/comments/:commentId', (request: requestCommentId) => {
  if (!uuidValidateV1(request.params.commentId)) {
    return new Response('Invalid commentId', { status: 400 });
  }
});

//delete post comment by commentId
router.delete('/posts/:postId/comments/:commentId', async (request: requestCommentId) => {
  try {
    const requestJson = await validateJson(request);

    const validParams = ['userName'];
    validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

    await post.removeComment(requestJson.userName, request.params.commentId);
    return new Response('Sucessfully deleted comment on post!');
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(error.message, { status: error.code });
    }
  }
});

//upvote comment by commentId
router.post(
  '/posts/:postId/comments/:commentId/upvote',
  async (request: requestCommentId) => {
    try {
      const requestJson = await validateJson(request);

      const validParams = ['userName'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

      await post.addCommentUpVote(requestJson.userName, request.params.commentId);
      return new Response('Sucessfully upvoted commented!');
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(error.message, { status: error.code });
      }
    }
  },
);

//remove comment upvote by commentId
router.delete(
  '/posts/:postId/comments/:commentId/upvote',
  async (request: requestCommentId) => {
    try {
      const requestJson = await validateJson(request);

      const validParams = ['userName'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

      await post.removeCommentUpVote(requestJson.userName, request.params.commentId);
      return new Response('Sucessfully removed upvote on comment!');
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(error.message, { status: error.code });
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

      const validParams = ['userName', 'type'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

      const reactionType = requestJson.type.split(/(?!$)/u)[0];
      validateReactionType(reactionType);

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

      await post.addCommentReaction(
        requestJson.userName,
        request.params.commentId,
        reactionType,
      );
      return new Response('Sucessfully reacted to comment!');
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(error.message, { status: error.code });
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

      const validParams = ['userName'];
      validateParametersCheckMissing(validParams, Object.keys(requestJson));

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

      await post.removeCommentReaction(requestJson.userName, request.params.commentId);
      return new Response('Sucessfully removed reaction from comment!');
    } catch (error) {
      if (error instanceof ValidationError) {
        return new Response(error.message, { status: error.code });
      }
    }
  },
);

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
