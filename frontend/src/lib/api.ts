import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001/api";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject token from localStorage
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("forgeflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function request(url: string, options: { method?: string; body?: string; params?: any } = {}) {
  try {
    const response = await httpClient({
      url,
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined,
      params: options.params,
    });
    return response.data;
  } catch (error: any) {
    const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred";
    throw new Error(errMsg);
  }
}

export const api = {
  auth: {
    register: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: any) => request("/auth/register", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    login: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: any) => request("/auth/login", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    me: {
      useQuery: (_input?: any, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["auth.me"],
          queryFn: () => request("/auth/me"),
          ...options,
        });
      }
    },
    update: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: any) => request("/auth/update", {
            method: "PUT",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    }
  },
  form: {
    create: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: any) => request("/forms", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    list: {
      useQuery: (input: { folderId?: string; isArchived?: boolean; search?: string } = {}, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["form.list", input],
          queryFn: () => {
            const params: any = {};
            if (input.folderId !== undefined) params.folderId = input.folderId;
            if (input.isArchived !== undefined) params.isArchived = String(input.isArchived);
            if (input.search !== undefined) params.search = input.search;
            return request("/forms", { params });
          },
          ...options,
        });
      }
    },
    get: {
      useQuery: (input: { id: string }, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["form.get", input.id],
          queryFn: () => request(`/forms/${input.id}`),
          ...options,
        });
      }
    },
    getPublic: {
      useQuery: (input: { id: string }, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["form.getPublic", input.id],
          queryFn: () => request(`/forms/public/${input.id}`),
          ...options,
        });
      }
    },
    update: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string; [key: string]: any }) => {
            const { id, ...body } = input;
            return request(`/forms/${id}`, {
              method: "PUT",
              body: JSON.stringify(body),
            });
          },
          ...options,
        });
      }
    },
    duplicate: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string }) => request(`/forms/${input.id}/duplicate`, {
            method: "POST",
          }),
          ...options,
        });
      }
    },
    delete: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string }) => request(`/forms/${input.id}`, {
            method: "DELETE",
          }),
          ...options,
        });
      }
    },
    createFolder: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { name: string }) => request("/folders", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    getFolders: {
      useQuery: (_input?: any, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["form.getFolders"],
          queryFn: () => request("/folders"),
          ...options,
        });
      }
    },
    deleteFolder: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string }) => request(`/folders/${input.id}`, {
            method: "DELETE",
          }),
          ...options,
        });
      }
    },
    listVersions: {
      useQuery: (input: { id: string }, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["form.listVersions", input.id],
          queryFn: () => request(`/forms/${input.id}/versions`),
          ...options,
        });
      }
    },
    rollbackVersion: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string; versionId: string }) => request(`/forms/${input.id}/versions/${input.versionId}/rollback`, {
            method: "POST"
          }),
          ...options,
        });
      }
    }
  },
  submission: {
    submit: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { formId: string; data: any; honeypot?: string }) => {
            const { formId, ...body } = input;
            return request(`/submissions/submit/${formId}`, {
              method: "POST",
              body: JSON.stringify(body),
            });
          },
          ...options,
        });
      }
    },
    list: {
      useQuery: (input: { formId: string; take?: number; skip?: number }, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["submission.list", input.formId, input.take, input.skip],
          queryFn: () => {
            const params: any = {};
            if (input.take !== undefined) params.take = String(input.take);
            if (input.skip !== undefined) params.skip = String(input.skip);
            return request(`/submissions/${input.formId}`, { params });
          },
          ...options,
        });
      }
    },
    getAnalytics: {
      useQuery: (input: { formId: string }, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["submission.getAnalytics", input.formId],
          queryFn: () => request(`/submissions/${input.formId}/analytics`),
          ...options,
        });
      }
    }
  },
  ai: {
    generateForm: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { prompt: string }) => request("/ai/generate-form", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    generateTheme: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { prompt: string }) => request("/ai/generate-theme", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    },
    analyzeSubmissions: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { formId: string }) => request("/ai/analyze-submissions", {
            method: "POST",
            body: JSON.stringify(input),
          }),
          ...options,
        });
      }
    }
  },
  admin: {
    getStats: {
      useQuery: (_input?: any, options?: any) => {
        return useQuery<any, any>({
          queryKey: ["admin.getStats"],
          queryFn: () => request("/admin/stats"),
          ...options,
        });
      }
    },
    deleteUser: {
      useMutation: (options?: any) => {
        return useMutation<any, any, any>({
          mutationFn: (input: { id: string }) => request(`/admin/users/${input.id}`, {
            method: "DELETE",
          }),
          ...options,
        });
      }
    }
  },
  useContext: () => {
    const queryClient = useQueryClient();
    return {
      form: {
        list: {
          invalidate: () => {
            queryClient.invalidateQueries(["form.list"]);
          }
        },
        getFolders: {
          invalidate: () => {
            queryClient.invalidateQueries(["form.getFolders"]);
          }
        }
      }
    };
  }
};
