// API layer: a thin client for the JSONPlaceholder REST API (https://jsonplaceholder.typicode.com).
// Tests call these methods instead of building URLs, so an endpoint change is a one-line fix.
import { APIRequestContext, APIResponse } from '@playwright/test';
import { ENV } from '../config/env';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export class PostsApi {
  constructor(private readonly request: APIRequestContext) {}

  list(query: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.request.get(`${ENV.apiURL}/posts`, { params: query });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`${ENV.apiURL}/posts/${id}`);
  }

  comments(postId: number): Promise<APIResponse> {
    return this.request.get(`${ENV.apiURL}/posts/${postId}/comments`);
  }

  create(data: Partial<Post>): Promise<APIResponse> {
    return this.request.post(`${ENV.apiURL}/posts`, { data });
  }

  update(id: number, data: Partial<Post>): Promise<APIResponse> {
    return this.request.put(`${ENV.apiURL}/posts/${id}`, { data });
  }

  remove(id: number): Promise<APIResponse> {
    return this.request.delete(`${ENV.apiURL}/posts/${id}`);
  }
}
