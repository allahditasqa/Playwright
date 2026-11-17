# API - Posts Test Cases

**Automation:** `tests/api/posts.spec.ts`  |  **Report:** `reports/api/posts test <DD-MM-YYYY>_<HH-mm>.html` (all reports: `reports/index.html`)

## Overview
REST API tests against the public JSONPlaceholder service (https://jsonplaceholder.typicode.com). No browser is used.

## Scope and notes
- JSONPlaceholder fakes write operations: a POST returns a new id but nothing is stored, so the tests are repeatable.

## A. Read

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_POSTS_01 | GET /posts returns status 200 and 100 posts | High | None | 1. Send GET /posts. | Status 200 and 100 posts. |
| TC_POSTS_02 | GET /posts/1 returns post 1 with userId, id, title and body | High | None | 1. Send GET /posts/1. | Status 200. The post has userId 1, id 1 and a title and a body that are not empty. |
| TC_POSTS_03 | GET /posts?userId=1 returns 10 posts and every post belongs to user 1 | Medium | None | 1. Send GET /posts?userId=1. | 10 posts are returned and all of them have userId 1. |
| TC_POSTS_04 | GET /posts/1/comments returns 5 comments and every email looks valid | Medium | None | 1. Send GET /posts/1/comments. | 5 comments are returned and every email looks valid. |
| TC_POSTS_05 | GET /posts/9999 returns status 404 for a post that does not exist | High | None | 1. Send GET /posts/9999. | Status 404. |

## B. Write

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_POSTS_06 | POST /posts with title "foo", body "bar" and userId 1 returns status 201 and the new id 101 | High | None | 1. Send POST /posts with title `foo`, body `bar` and userId 1. | Status 201. The answer contains the sent data and the new id 101. |
| TC_POSTS_07 | PUT /posts/1 with the title "updated title" returns status 200 and the new title | Medium | None | 1. Send PUT /posts/1 with the title `updated title`. | Status 200 and the title is `updated title`. |
| TC_POSTS_08 | DELETE /posts/1 returns status 200 | Medium | None | 1. Send DELETE /posts/1. | Status 200. |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 8 | 4 | 8 |
