import {SnippetOperations} from '../snippetOperations';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet';
import autoBind from 'auto-bind';
import {PaginatedUsers} from "../users";
import {TestCase} from "../../types/TestCase";
import {TestCaseResult} from "../queries";
import {FileType} from "../../types/FileType";
import {Rule} from "../../types/Rule";
import { User } from '@auth0/auth0-react';
import {toast} from "react-toastify";

/*
const SNIPPET_MANAGER_URL = "http://localhost:8000/api";
const PS_SERVICE_URL = "http://localhost:8004/api";
const API_BASE_URL = "http://localhost:8000/api";
const PERMISSION_SERVICE_URL = "http://localhost:8003/api/permission";
 */


const SNIPPET_MANAGER_URL = `${window.location.protocol}//${window.location.hostname}/snippet-manager/api` ;
const PS_SERVICE_URL = `${window.location.protocol}//${window.location.hostname}/printscript-service/api`; 
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}`;
const PERMISSION_SERVICE_URL = `${window.location.protocol}//${window.location.hostname}/permission-manager/api/permission`;



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
    formData.append("content", fileBlob, `${createSnippet.name}.${createSnippet.extension}`);
    formData.append("name", createSnippet.name);
    formData.append("language", createSnippet.language);
    formData.append("extension", createSnippet.extension)

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      toast.error(`Error creating snippet: ${await response.text()}`);
      throw new Error(`Error creating snippet: ${await response.text()}`);
    }
    else {
        toast.success("Snippet created successfully");
    }

    return await response.json();
  }

  async getSnippetById(id: string): Promise<Snippet | undefined> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet/${id}`, {
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
    localStorage.setItem("authAccessToken", accessToken);
    const from = (page + 1) * pageSize - pageSize;
    const to = (page + 1) * pageSize;

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet?from=${from}&to=${to}`, {
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
      count: data.maxSnippets,
      snippets: data.snippets
    };

    return result;
  }


  async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    const accessToken = await this.getAccessTokenSilently();

    const formData = new FormData();
    const fileBlob = new Blob([updateSnippet.content], { type: 'text/plain' });
    formData.append("content", fileBlob);

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      toast.error(`Error updating snippet: ${await response.text()}`);
      throw new Error(`Error updating snippet: ${await response.text()}`);
    }
    else {
        toast.success("Snippet updated successfully");
    }

    return await response.json();
  }

  async getUserFriends(name: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> {
    const accessToken = await this.getAccessTokenSilently();
    console.log(name);
    const response = await fetch(`${SNIPPET_MANAGER_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const users: User[] = await response.json();
    
    return {
      page: page,
      page_size: pageSize,
      count: users.length,
      users: users
    } as PaginatedUsers;
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

    if (!response.ok) {
      toast.error(`Error sharing snippet: ${await response.text()}`);
      throw new Error(`Error sharing snippet: ${await response.text()}`);
    }
    else {
        toast.success("Snippet shared successfully");
    }

    return await response.json();
  }

  async getFormatRules(): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/formatter-rule`, {
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
      isActive: ruleDto.isActive,
      value: ruleDto.value
    }));
  }

  async getLintingRules(): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/linting-rule`, {
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
      id: "",
      name: ruleDto.name,
      isActive: ruleDto.isActive,
      value: ruleDto.value
    }));
  }

  async formatSnippet(snippetContent: string): Promise<string> {
    const accessToken = await this.getAccessTokenSilently();
    const response = await fetch(`${PS_SERVICE_URL}/format`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ content: snippetContent })
    });
    if (!response.ok) {
      toast.error(`Error formatting snippet: ${await response.text()}`);
    }
    else {
        toast.success("Snippet formatted successfully");
    }

    return await response.text();
  }


  async getTestCases(snippetId: string): Promise<TestCase[]> {
    const accessToken = await this.getAccessTokenSilently();

    console.log(snippetId)
    const response = await fetch(`${API_BASE_URL}/snippet/testCases/${snippetId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
        });


    return await response.json();
  }


  async postTestCase(testCase: TestCase, snippetId: string): Promise<TestCase> {
    const accessToken = await this.getAccessTokenSilently();
    console.log(testCase);
    console.log(snippetId)
    const response = await fetch(`${API_BASE_URL}/snippet/testCases/${snippetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(testCase)
    });
    if (!response.ok) {
      toast.error(`Error fetching test cases: ${await response.text()}`);
    }
    return await response.json();
  }


  async removeTestCase(id: string): Promise<string> {
    const accessToken = await this.getAccessTokenSilently();
    const response = await fetch(`${API_BASE_URL}/snippet/testCases/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }});
    if (!response.ok) {
      toast.error(`Error removing test case: ${await response.text()}`);
    }
    else {
        toast.success("Test case removed successfully");
    }
    return id;
  }

  async testSnippet(testCase: TestCase, snippetId : string): Promise<TestCaseResult> {
    const accessToken = await this.getAccessTokenSilently();
    console.log(testCase);
    console.log(snippetId)
    const response = await fetch(`${API_BASE_URL}/snippet/testCases/test/${snippetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(testCase)
    });
    return await response.text() as TestCaseResult;
  }

  async deleteSnippet(id: string): Promise<string> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      toast.error(`Error deleting snippet: ${await response.text()}`);
    }
    else {
        toast.success("Snippet deleted successfully");
    }

    return await response.text();
  }

  async getFileTypes(): Promise<FileType[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/snippet/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch linting rules");
    }

    return await response.json() as FileType[];
  }

  async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/formatter-rule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(newRules)
    });

    if (!response.ok) {
      toast.error(`Error updating formatting rules: ${await response.text()}`);

      throw new Error("Failed to update format rules");
    }
    else {
      toast.success("Format rules updated successfully");
    }

    const updatedRules: Rule[] = await response.json();
    return updatedRules;
  }

  async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    const accessToken = await this.getAccessTokenSilently();

    const response = await fetch(`${SNIPPET_MANAGER_URL}/linting-rule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(newRules)
    });

    if (!response.ok) {
      toast.error(`Error updating linting rules: ${await response.text()}`);
      throw new Error("Failed to update linting rules");
    }
    else {
        toast.success("Linting rules updated successfully");
    }

    const updatedRules: Rule[] = await response.json();
    return updatedRules;
  }
}