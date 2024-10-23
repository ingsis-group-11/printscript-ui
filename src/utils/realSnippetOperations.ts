import { SnippetOperations } from './snippetOperations';
import {
  CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet
} from './snippet';
import { PaginatedUsers } from "./users.ts";
import { TestCase } from "../types/TestCase.ts";
import { TestCaseResult } from "./queries.tsx";
import { FileType } from "../types/FileType.ts";
import { Rule } from "../types/Rule.ts";

class RealSnippetOperations implements SnippetOperations {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
    const response = await fetch(`/api/snippets?page=${page}&pageSize=${pageSize}&name=${snippetName}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
    const response = await fetch('/api/snippets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createSnippet),
    });
    return response.json();
  }

  async getSnippetById(id: string): Promise<Snippet | undefined> {
    const response = await fetch(`/api/snippets/${id}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    return undefined; // Maneja el caso cuando no se encuentra el snippet.
  }

  async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    const response = await fetch(`/api/snippets/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateSnippet),
    });
    return response.json();
  }

  async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
    const response = await fetch(`/api/users/friends?name=${name}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
    const response = await fetch(`/api/snippets/${snippetId}/share/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async getFormatRules(): Promise<Rule[]> {
    const response = await fetch(`/api/rules/format`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async getLintingRules(): Promise<Rule[]> {
    const response = await fetch(`/api/rules/linting`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async getTestCases(): Promise<TestCase[]> {
    const response = await fetch(`/api/testcases`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async formatSnippet(snippet: string): Promise<string> {
    const response = await fetch(`/api/snippets/format`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ snippet }),
    });
    return response.json();
  }

  async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
    const response = await fetch(`/api/testcases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase),
    });
    return response.json();
  }

  async removeTestCase(id: string): Promise<string> {
    const response = await fetch(`/api/testcases/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.text(); // Devuelve el mensaje de eliminación.
  }

  async deleteSnippet(id: string): Promise<string> {
    const response = await fetch(`/api/snippets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.text();
  }

  async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
    const response = await fetch(`/api/testcases/test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase),
    });
    return response.json();
  }

  async getFileTypes(): Promise<FileType[]> {
    const response = await fetch(`/api/filetypes`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`/api/rules/format`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRules),
    });
    return response.json();
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`/api/rules/linting`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRules),
    });
    return response.json();
  }
}

export default RealSnippetOperations;