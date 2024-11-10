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
const FORMATTER_SERVICE_URL = 'http://localhost:8000/api/formatter-rule';
const LINTTER_SERVICE_URL = 'http://localhost:8000/api/linting-rule';
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

  async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
    const accessToken = await this.getAccessTokenSilently();
    const from = (page + 1) * pageSize - pageSize;
    const to = (page + 1) * pageSize;

    const response = await fetch(`${SNIPPET_MANAGER_URL}?from=${from}&to=${to}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Leer el JSON solo una vez
    const data = await response.json();

    const result: PaginatedSnippets = {
      page: page,
      page_size: pageSize,
      count: data.length,
      snippets: data
    };

    return result;
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

  async getFormatRules(): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${FORMATTER_SERVICE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch format rules");
    }

    const rulesDto: Rule[] = await response.json();
    return rulesDto.map(ruleDto => ({
      id: "",
      name: ruleDto.name,
      isActive: typeof ruleDto.value === "boolean" ? ruleDto.value : false,
      value: typeof ruleDto.value !== "boolean" ? ruleDto.value : null
    }));
  }

  async getLintingRules(): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${LINTTER_SERVICE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch linting rules");
    }

    const rulesDto: Rule[] = await response.json();
    return rulesDto.map(ruleDto => ({
      id: ruleDto.id,
      name: ruleDto.name,
      isActive: typeof ruleDto.value === 'boolean' ? ruleDto.value : true,
      value: typeof ruleDto.value !== 'boolean' ? ruleDto.value : null
    }));
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

    const response = await fetch(`${SNIPPET_MANAGER_URL}/${id}`, {
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

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();
    const ruleDtos = newRules.map(rule => ({
      name: rule.name,
      value: rule.value !== null && rule.value !== undefined ? rule.value : rule.isActive
    }));

    const response = await fetch(`${FORMATTER_SERVICE_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(ruleDtos)
    });

    if (!response.ok) {
      throw new Error("Failed to update format rules");
    }

    const updatedRules: Rule[] = await response.json();
    return updatedRules;
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();
    const ruleDtos = newRules.map(rule => ({
      name: rule.name,
      value: rule.value !== null && rule.value !== undefined ? rule.value : rule.isActive
    }));

    const response = await fetch(`${LINTTER_SERVICE_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(ruleDtos)
    });

    if (!response.ok) {
      throw new Error("Failed to update linting rules");
    }

    const updatedRules: Rule[] = await response.json();
    return updatedRules;
  }
}