import {SnippetOperations} from '../snippetOperations';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet';
import autoBind from 'auto-bind';
import {PaginatedUsers} from "../users";
import {TestCase} from "../../types/TestCase";
import {TestCaseResult} from "../queries";
import {FileType} from "../../types/FileType";
import {Rule} from "../../types/Rule";
import {FakeSnippetStore} from '../mock/fakeSnippetStore'

const SNIPPET_MANAGER_URL = 'http://localhost:8000/api/snippet';
const API_BASE_URL = 'http://localhost:8080';
const PERMISSION_SERVICE_URL = 'http://localhost:8003/api/permission';

export class RealSnippetOperations implements SnippetOperations {
  private readonly fakeStore = new FakeSnippetStore()
  private getAccessTokenSilently: () => Promise<string>;

  constructor(getAccessTokenSilently: () => Promise<string>) {
    this.getAccessTokenSilently = getAccessTokenSilently;
    autoBind(this);
  }

  async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
    const accessToken = await this.getAccessTokenSilently();

    const formData = new FormData();
    const fileBlob = new Blob([createSnippet.content], { type: 'text/plain' }); 
    formData.append("content", fileBlob, `${createSnippet.name}.${createSnippet.extension}`);
    formData.append("version", "1.1");
    formData.append("name", createSnippet.name);
    formData.append("language", createSnippet.language);
    formData.append("extension", createSnippet.extension)

    const response = await fetch(`${SNIPPET_MANAGER_URL}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      alert(`Error creating snippet: ${response.statusText}`);
      throw new Error(`Error creating snippet: ${response.statusText}`);
    }

    return await response.json();
  }

  async getSnippetById(id: string): Promise<Snippet | undefined> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) return undefined;
    return await response.json() as Snippet;
  }

  // TODO
  async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> { 
    const response: PaginatedSnippets = {
      page: page,
      page_size: pageSize,
      count: 20,
      snippets: page == 0 ? this.fakeStore.listSnippetDescriptors().splice(0,pageSize) : this.fakeStore.listSnippetDescriptors().splice(1,2)
    }

    return new Promise(resolve => {
      resolve(response)
    })
  }

  async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    const accessToken = await this.getAccessTokenSilently();

    const formData = new FormData();
    const fileBlob = new Blob([updateSnippet.content], { type: 'text/plain' }); 
    formData.append("content", fileBlob);

    const response = await fetch(`${SNIPPET_MANAGER_URL}/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      alert(`Error updating snippet: ${response.statusText}`);
      throw new Error(`Error updating snippet: ${response.statusText}`);
    }

    return await response.json();
  }

  // TODO
  async getUserFriends(name: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> {
    const response = await fetch(`${API_BASE_URL}/users/friends?name=${name}&page=${page}&pageSize=${pageSize}`);
    return await response.json();
  }

  async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
    const accessToken = await this.getAccessTokenSilently();
  
    const data = JSON.stringify({
      snippetId: snippetId,
      toUserId: userId
    });
  
    const response = await fetch(`${PERMISSION_SERVICE_URL}/share`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });
  
    return await response.json();
  }

  // TODO
  async getFormatRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/format`);
    return await response.json();
  }

  // TODO
  async getLintingRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/lint`);
    return await response.json();
  }

  // TODO
  async formatSnippet(snippetContent: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/snippets/format`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: snippetContent })
    });
    return await response.json();
  }

  // TODO
  async getTestCases(): Promise<TestCase[]> {
    const response = await fetch(`${API_BASE_URL}/testCases`);
    return await response.json();
  }

  // TODO
  async postTestCase(testCase: TestCase): Promise<TestCase> {
    const response = await fetch(`${API_BASE_URL}/testCases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    return await response.json();
  }

  // TODO
  async removeTestCase(id: string): Promise<string> {
    await fetch(`${API_BASE_URL}/testCases/${id}`, { method: 'DELETE' });
    return id;
  }

  // TODO
  async testSnippet(): Promise<TestCaseResult> {
    const response = await fetch(`${API_BASE_URL}/snippets/test`, { method: 'DELETE' });
    return await response.json();
  }

  async deleteSnippet(id: string): Promise<string> {
    const accessToken = await this.getAccessTokenSilently();
  
    const response = await fetch(`${SNIPPET_MANAGER_URL}(${id})`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return await response.text();
  }

  // TODO
  async getFileTypes(): Promise<FileType[]> {
    return new Promise(resolve => {
      resolve(this.fakeStore.getFileTypes())
    })
  }

  // TODO
  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/format`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRules)
    });
    return await response.json();
  }

  // TODO
  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}/rules/lint`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRules)
    });
    return await response.json();
  }
}
