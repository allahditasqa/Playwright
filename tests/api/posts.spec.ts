// API tests against the public JSONPlaceholder REST API. Test cases: docs/test-cases/api-posts.md (same IDs).
// No browser is used: these run fast and show the framework also covers the API layer.
import { Comment, Post } from '../../api/PostsApi';
import { expect, test } from '../../fixtures/test-fixtures';

test.describe('Posts API - read', () => {
  test('TC_POSTS_01 - GET /posts returns status 200 and 100 posts', async ({ postsApi }) => {
    const response = await postsApi.list();

    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveLength(100);
  });

  test('TC_POSTS_02 - GET /posts/1 returns post 1 with userId, id, title and body', async ({ postsApi }) => {
    const response = await postsApi.get(1);
    const post: Post = await response.json();

    expect(response.status()).toBe(200);
    expect(post).toMatchObject({ userId: 1, id: 1 });
    expect(post.title).not.toBe('');
    expect(post.body).not.toBe('');
  });

  test('TC_POSTS_03 - GET /posts?userId=1 returns 10 posts and every post belongs to user 1', async ({ postsApi }) => {
    const posts: Post[] = await (await postsApi.list({ userId: 1 })).json();

    expect(posts).toHaveLength(10);
    expect(posts.every((post) => post.userId === 1)).toBe(true);
  });

  test('TC_POSTS_04 - GET /posts/1/comments returns 5 comments and every email looks valid', async ({ postsApi }) => {
    const comments: Comment[] = await (await postsApi.comments(1)).json();

    expect(comments).toHaveLength(5);
    for (const comment of comments) {
      expect(comment.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    }
  });

  test('TC_POSTS_05 - GET /posts/9999 returns status 404 for a post that does not exist', async ({ postsApi }) => {
    const response = await postsApi.get(9999);

    expect(response.status()).toBe(404);
  });
});

test.describe('Posts API - write', () => {
  test('TC_POSTS_06 - POST /posts with title "foo", body "bar" and userId 1 returns status 201 and the new id 101', async ({
    postsApi,
  }) => {
    const response = await postsApi.create({ title: 'foo', body: 'bar', userId: 1 });

    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ title: 'foo', body: 'bar', userId: 1, id: 101 });
  });

  test('TC_POSTS_07 - PUT /posts/1 with the title "updated title" returns status 200 and the new title', async ({
    postsApi,
  }) => {
    const response = await postsApi.update(1, { id: 1, title: 'updated title', body: 'bar', userId: 1 });

    expect(response.status()).toBe(200);
    expect((await response.json()).title).toBe('updated title');
  });

  test('TC_POSTS_08 - DELETE /posts/1 returns status 200', async ({ postsApi }) => {
    const response = await postsApi.remove(1);

    expect(response.status()).toBe(200);
  });
});
