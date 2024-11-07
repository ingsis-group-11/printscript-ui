import {SnippetOperations} from '../snippetOperations';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet';
import autoBind from 'auto-bind';
import {PaginatedUsers} from "../users";
import {TestCase} from "../../types/TestCase";
import {TestCaseResult} from "../queries";
import {FileType} from "../../types/FileType";
import {Rule} from "../../types/Rule";

const API_BASE_URL = "http://localhost:80";

export class RealSnippetOperations implements SnippetOperations {
  private getAccessTokenSilently: () => Promise<string>;

  constructor(getAccessTokenSilently: () => Promise<string>) {
    this.getAccessTokenSilently = getAccessTokenSilently;
    autoBind(this);
  }

  async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
    const accessToken = await this.getAccessTokenSilently();

    const formData = new FormData();
    const fileBlob = new Blob([createSnippet.content], { type: 'text/plain' }); 
    formData.append("file", fileBlob, `${createSnippet.name}.${createSnippet.extension}`);
    formData.append("version", "1.1");
    formData.append("name", createSnippet.name);
    formData.append("language", createSnippet.language);

    const response = await fetch(`${API_BASE_URL}/api/snippets`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error creating snippet: ${response.statusText}`);
    }

    return await response.json();
  }

  async getSnippetById(id: string): Promise<Snippet | undefined> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`);
    if (!response.ok) return undefined;
    return await response.json();
  }

  async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
    const response = await fetch(`${API_BASE_URL}/snippets?page=${page}&pageSize=${pageSize}`);
    return await response.json();
  }

  async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateSnippet)
    });
    return await response.json();
  }

  async getUserFriends(name: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> {
    const response = await fetch(`${API_BASE_URL}/users/friends?name=${name}&page=${page}&pageSize=${pageSize}`);
    return await response.json();
  }

  async shareSnippet(snippetId: string): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets/${snippetId}/share`, { method: 'POST' });
    return await response.json();
  }

  async getFormatRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/format`);
    return await response.json();
  }

  async getLintingRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/lint`);
    return await response.json();
  }

  async formatSnippet(snippetContent: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/snippets/format`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: snippetContent })
    });
    return await response.json();
  }

  async getTestCases(): Promise<TestCase[]> {
    const response = await fetch(`${API_BASE_URL}/testCases`);
    return await response.json();
  }

  async postTestCase(testCase: TestCase): Promise<TestCase> {
    const response = await fetch(`${API_BASE_URL}/testCases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    return await response.json();
  }

  async removeTestCase(id: string): Promise<string> {
    await fetch(`${API_BASE_URL}/testCases/${id}`, { method: 'DELETE' });
    return id;
  }

  async testSnippet(): Promise<TestCaseResult> {
    const response = await fetch(`${API_BASE_URL}/snippets/test`, { method: 'POST' });
    return await response.json();
  }

  async deleteSnippet(id: string): Promise<string> {
    await fetch(`${API_BASE_URL}/snippets/${id}`, { method: 'DELETE' });
    return id;
  }

  async getFileTypes(): Promise<FileType[]> {
    const response = await fetch(`${API_BASE_URL}/fileTypes`);
    return await response.json();
  }

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/format`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRules)
    });
    return await response.json();
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/lint`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRules)
    });
    return await response.json();
  }
}
