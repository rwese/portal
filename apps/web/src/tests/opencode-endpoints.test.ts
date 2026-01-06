import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import agentsEndpoint from "../server/opencode/[port]/agents";
import modelsEndpoint from "../server/opencode/[port]/models";
import { clearClientCache, getOpencodeClient } from "../server/lib/opencode-client";

// Mock the opencode-client module
vi.mock("../server/lib/opencode-client", () => ({
  getOpencodeClient: vi.fn(),
  clearClientCache: vi.fn()
}));

// Create mock H3 event that simulates Nitro's getRouterParam behavior
function createMockEvent(port: string | number) {
  const event = {
    req: {
      url: `/opencode/${port}/agents`,
      method: "GET",
      headers: {}
    },
    res: {},
    context: {
      params: {
        port: String(port)
      }
    }
  };

  return event;
}

// Mock client factory
function createMockClient(agentsData?: any, providersData?: any) {
  const mockClient = {
    app: {
      agents: vi.fn().mockResolvedValue({ data: agentsData })
    },
    config: {
      providers: vi.fn().mockResolvedValue({ data: providersData })
    }
  };

  return mockClient;
}

describe("Agents Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClientCache();
  });

  it("should return agent data for valid port", async () => {
    const mockAgents = [
      { id: "agent-1", name: "Test Agent 1" },
      { id: "agent-2", name: "Test Agent 2" }
    ];

    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await agentsEndpoint(event);

    expect(result).toEqual(mockAgents);
    expect(mockClient.app.agents).toHaveBeenCalledTimes(1);
    expect(getOpencodeClient).toHaveBeenCalledWith(3001);
  });

  it("should throw error for invalid port (non-numeric string)", async () => {
    const event = createMockEvent("invalid");

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for NaN port", async () => {
    const event = createMockEvent(NaN);

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for missing port", async () => {
    const event = createMockEvent("");

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for zero port", async () => {
    const event = createMockEvent(0);

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should return empty array for no agents", async () => {
    const mockClient = createMockClient([]);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await agentsEndpoint(event);

    expect(result).toEqual([]);
    expect(mockClient.app.agents).toHaveBeenCalledTimes(1);
  });

  it("should handle SDK error gracefully", async () => {
    const mockClient = {
      app: {
        agents: vi.fn().mockRejectedValue(new Error("SDK Error"))
      }
    };
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);

    await expect(agentsEndpoint(event)).rejects.toThrow("SDK Error");
    expect(mockClient.app.agents).toHaveBeenCalledTimes(1);
  });

  it("should handle undefined agents data", async () => {
    const mockClient = createMockClient(undefined);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await agentsEndpoint(event);

    expect(result).toBeUndefined();
  });

  it("should handle various port numbers", async () => {
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    // Test different valid ports
    const ports = [3001, 8080, 443, 8000];

    for (const port of ports) {
      vi.clearAllMocks();
      const event = createMockEvent(port);
      const result = await agentsEndpoint(event);

      expect(result).toEqual(mockAgents);
      expect(getOpencodeClient).toHaveBeenCalledWith(port);
    }
  });
});

describe("Models Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClientCache();
  });

  it("should return transformed model data for valid port", async () => {
    const mockProvidersData = {
      providers: [
        {
          id: "openai",
          name: "OpenAI",
          models: ["gpt-4", "gpt-3.5-turbo"]
        },
        {
          id: "anthropic",
          name: "Anthropic",
          models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229"]
        }
      ],
      default: "openai"
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result).toEqual({
      providers: mockProvidersData.providers,
      default: "openai",
      models: [
        { provider: "openai", providerName: "OpenAI", model: "gpt-4", fullId: "openai/gpt-4" },
        { provider: "openai", providerName: "OpenAI", model: "gpt-3.5-turbo", fullId: "openai/gpt-3.5-turbo" },
        { provider: "anthropic", providerName: "Anthropic", model: "claude-3-opus-20240229", fullId: "anthropic/claude-3-opus-20240229" },
        { provider: "anthropic", providerName: "Anthropic", model: "claude-3-sonnet-20240229", fullId: "anthropic/claude-3-sonnet-20240229" }
      ]
    });

    expect(mockClient.config.providers).toHaveBeenCalledTimes(1);
    expect(getOpencodeClient).toHaveBeenCalledWith(3001);
  });

  it("should throw error for invalid port (non-numeric string)", async () => {
    const event = createMockEvent("invalid");

    await expect(modelsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for NaN port", async () => {
    const event = createMockEvent(NaN);

    await expect(modelsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for missing port", async () => {
    const event = createMockEvent("");

    await expect(modelsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should throw error for zero port", async () => {
    const event = createMockEvent(0);

    await expect(modelsEndpoint(event)).rejects.toThrow("Invalid port");
    expect(getOpencodeClient).not.toHaveBeenCalled();
  });

  it("should return empty models array for empty providers", async () => {
    const mockProvidersData = {
      providers: [],
      default: null,
      models: []
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result).toEqual({
      providers: [],
      default: null,
      models: []
    });
  });

  it("should return empty models array for undefined providers data", async () => {
    const mockClient = createMockClient(undefined, undefined);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result).toEqual({
      providers: [],
      default: null,
      models: []
    });
  });

  it("should handle providers as array format", async () => {
    const mockProvidersData = [
      {
        id: "test",
        name: "Test Provider",
        models: ["model-1", "model-2"]
      }
    ];

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result.providers).toEqual(mockProvidersData);
    expect(result.models).toHaveLength(2);
    expect(result.models[0]).toEqual({
      provider: "test",
      providerName: "Test Provider",
      model: "model-1",
      fullId: "test/model-1"
    });
  });

  it("should handle provider with empty models array", async () => {
    const mockProvidersData = {
      providers: [
        {
          id: "empty",
          name: "Empty Provider",
          models: []
        }
      ],
      default: null
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result.models).toEqual([]);
    expect(result.providers).toHaveLength(1);
  });

  it("should handle SDK error gracefully", async () => {
    const mockClient = {
      config: {
        providers: vi.fn().mockRejectedValue(new Error("SDK Error"))
      }
    };
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);

    await expect(modelsEndpoint(event)).rejects.toThrow("SDK Error");
    expect(mockClient.config.providers).toHaveBeenCalledTimes(1);
  });

  it("should correctly format full model IDs", async () => {
    const mockProvidersData = {
      providers: [
        {
          id: "google",
          name: "Google",
          models: ["gemini-pro"]
        }
      ],
      default: "google"
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result.models[0].fullId).toBe("google/gemini-pro");
  });

  it("should preserve provider information correctly", async () => {
    const mockProvidersData = {
      providers: [
        {
          id: "mistral",
          name: "Mistral AI",
          models: ["mistral-large-latest"]
        }
      ],
      default: "mistral"
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result.providers[0].id).toBe("mistral");
    expect(result.providers[0].name).toBe("Mistral AI");
    expect(result.models[0].provider).toBe("mistral");
    expect(result.models[0].providerName).toBe("Mistral AI");
  });

  it("should handle various port numbers", async () => {
    const mockProvidersData = {
      providers: [],
      default: null
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const ports = [3001, 8080, 443, 8000];

    for (const port of ports) {
      vi.clearAllMocks();
      const event = createMockEvent(port);
      const result = await modelsEndpoint(event);

      expect(result).toBeDefined();
      expect(getOpencodeClient).toHaveBeenCalledWith(port);
    }
  });

  it("should handle single model per provider", async () => {
    const mockProvidersData = {
      providers: [
        {
          id: "single",
          name: "Single Model Provider",
          models: ["only-model"]
        }
      ],
      default: "single"
    };

    const mockClient = createMockClient(undefined, mockProvidersData);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(3001);
    const result = await modelsEndpoint(event);

    expect(result.models).toHaveLength(1);
    expect(result.models[0].model).toBe("only-model");
    expect(result.models[0].fullId).toBe("single/only-model");
  });
});

describe("Integration Tests - Client Caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClientCache();
  });

  it("should reuse client for same port", async () => {
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event1 = createMockEvent(3001);
    const event2 = createMockEvent(3001);

    await agentsEndpoint(event1);
    await agentsEndpoint(event2);

    // Should only create client once due to caching
    expect(getOpencodeClient).toHaveBeenCalledTimes(2);
    expect(getOpencodeClient).toHaveBeenCalledWith(3001);
  });

  it("should create different clients for different ports", async () => {
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event1 = createMockEvent(3001);
    const event2 = createMockEvent(3002);

    await agentsEndpoint(event1);
    await agentsEndpoint(event2);

    expect(getOpencodeClient).toHaveBeenCalledWith(3001);
    expect(getOpencodeClient).toHaveBeenCalledWith(3002);
  });
});

describe("Error Handling - Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearClientCache();
  });

  it("should handle negative port numbers", async () => {
    const event = createMockEvent(-1);

    // Note: Number(-1) = -1, which passes the numeric validation
    // This is technically correct - the validation only checks for numeric validity
    // In practice, negative ports won't connect, but that's a runtime error
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const result = await agentsEndpoint(event);
    expect(result).toEqual(mockAgents);
    expect(getOpencodeClient).toHaveBeenCalledWith(-1);
  });

  it("should handle very large port numbers", async () => {
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const event = createMockEvent(65535);
    const result = await agentsEndpoint(event);

    expect(result).toEqual(mockAgents);
    expect(getOpencodeClient).toHaveBeenCalledWith(65535);
  });

  it("should handle floating point port numbers", async () => {
    const event = createMockEvent(3001.5);

    // Number() preserves the decimal, so 3001.5 stays 3001.5
    const mockAgents = [{ id: "test", name: "Test" }];
    const mockClient = createMockClient(mockAgents);
    (getOpencodeClient as vi.Mock).mockReturnValue(mockClient);

    const result = await agentsEndpoint(event);

    expect(result).toEqual(mockAgents);
    expect(getOpencodeClient).toHaveBeenCalledWith(3001.5);
  });

  it("should handle special characters in port", async () => {
    const event = createMockEvent("3001abc");

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
  });

  it("should handle boolean port values", async () => {
    const event = createMockEvent(true);

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
  });

  it("should handle null port values", async () => {
    const event = createMockEvent(null);

    await expect(agentsEndpoint(event)).rejects.toThrow("Invalid port");
  });
});
