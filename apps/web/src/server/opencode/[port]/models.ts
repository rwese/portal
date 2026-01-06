import { defineHandler, getRouterParam } from "nitro/h3";
import { getOpencodeClient } from "../../lib/opencode-client";

export default defineHandler(async (event) => {
  const port = Number(getRouterParam(event, "port"));
  
  if (!port || isNaN(port)) {
    throw new Error("Invalid port");
  }

  const client = getOpencodeClient(port);
  const providersResponse = await client.config.providers();
  
  // Handle potentially undefined response data
  const providersData = providersResponse.data;
  if (!providersData) {
    return {
      providers: [],
      default: null,
      models: []
    };
  }
  
  // Get providers array safely - handle different possible structures
  const providers = Array.isArray(providersData) ? providersData : 
                   (providersData.providers || []);
  
  // Transform provider data into comprehensive model listing
  const models = [];
  
  for (const provider of providers) {
    const providerModels = Array.isArray(provider.models) ? provider.models : [];
    for (const model of providerModels) {
      models.push({
        provider: provider.id,
        providerName: provider.name,
        model: model,
        fullId: `${provider.id}/${model}`
      });
    }
  }
  
  return {
    providers: providers,
    default: providersData.default || null,
    models: models
  };
});
