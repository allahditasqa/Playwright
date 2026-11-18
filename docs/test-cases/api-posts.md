# API - Posts Test Cases

**Module:** API | **Sub-module:** Posts | **Spec:** `tests/api/posts.spec.ts`
**Report:** `reports/<module>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/api-posts.csv`

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

## Traceability

Every case is automated. Requirement IDs are listed in [TEST_STRATEGY.md](../TEST_STRATEGY.md).

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_POSTS_01 | API / Functional | GET /posts | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Listing all resources |
| TC_POSTS_02 | API / Functional | GET /posts/1 | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Getting a resource |
| TC_POSTS_03 | API / Functional | GET /posts?userId=1 | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Filtering resources |
| TC_POSTS_04 | API / Functional | GET /posts/1/comments | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Listing nested resources |
| TC_POSTS_05 | API / Negative | GET /posts/9999 | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Getting a resource |
| TC_POSTS_06 | API / Functional | POST /posts, body {title: foo, body: bar, userId: 1} | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Creating a resource |
| TC_POSTS_07 | API / Functional | PUT /posts/1, body {title: updated title} | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Updating a resource |
| TC_POSTS_08 | API / Functional | DELETE /posts/1 | Automated | `tests/api/posts.spec.ts` | JSONPlaceholder guide: Deleting a resource |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 8 | 4 | 8 |
