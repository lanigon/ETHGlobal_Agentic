import { createAgent } from 'ts-swarm';
import { createOpenAI } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
import { custom, z } from 'zod';
import { generateText, tool } from 'ai'

// embed js
import { RAGApplicationBuilder } from '@llm-tools/embedjs';
import { LibSqlStore, LibSqlDb } from '@llm-tools/embedjs-libsql';
import { OpenAiEmbeddings, OpenAi } from '@llm-tools/embedjs-openai';
import { WebLoader } from '@llm-tools/embedjs-loader-web';

// viem
import { createPublicClient, http, createWalletClient, Hex, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { toHex, Address } from 'viem'

function createModel(baseUrl: string, apiKey: string) {
    const model = createOpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });
    return model;
}

async function testCompletion(baseUrl: string, apiKey: string, model_name: string, prompt: string) {
    const glmModel = createModel(baseUrl, apiKey) as any;
    const { text } = await generateText({
        model: glmModel(model_name, { structuredOutputs: true }),
        prompt: prompt,
        maxTokens: 100,
    })
    console.log(text);
}

async function testSwarmAgent(baseUrl: string, apiKey: string, model_name: string) {
  const glmModel = createModel(baseUrl, apiKey) as any;

  // Create the Weather Agent
  const weatherAgent = createAgent({
    id: 'Weather_Agent',
    model: glmModel(model_name, { structuredOutputs: true }),
    system: `
      You are a weather assistant. 
      Your role is to:
        - Provide weather information for requested locations
        - Use the weather tool to fetch weather data`,
    tools: [
      {
        id: 'weather',
        description: 'Get the weather for a specific location',
        parameters: z.object({
          location: z.string().describe('The location to get weather for'),
        }),
        execute: async ({ location }) => {
          // Mock weather API call
          return `The weather in ${location} is sunny with a high of 67°F.`;
        },
      },
    ],
  });
  
  // Create the Triage Agent
  const triageAgent = createAgent({
    id: 'Triage_Agent',
    model: glmModel(model_name, { structuredOutputs: true }),
    system: `
      You are a helpful triage agent. 
      Your role is to:
        - Answer the user's questions by transferring to the appropriate agent`,
    tools: [
      // Add ability to transfer to the weather agent
      weatherAgent,
    ],
  });


  const result = await triageAgent.run({
    // Example conversation passed in
    messages: [
      { role: 'user', content: "What's the weather like in New York?" },
    ],
  });

  /**
   * We could wrap this logic in a loop to continue the conversation by
   * utilizing `result.activeAgent` which represents the last active agent during the run
   * For this example `result.activeAgent` would now be the weather agent
   * Refer to the `run.ts` example for an example of this
   */

  // Log the last message (or the entire conversation if you prefer)
  const lastMessage = result.messages.at(-1);
  console.log(
    `${lastMessage?.swarmMeta?.agentId || 'User'}: ${lastMessage?.content}`,
  );
  // console.log(lastMessage?.content);
  
  return result;
}

async function testRAGApp() {
    const customEmbeddings = new OpenAiEmbeddings({
      model: "embedding-3",
      dimensions: 512,
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.BASE_URL,
      }
    });
    const customBaseModel = new OpenAi({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.MODEL_NAME,
      configuration: {
        baseURL: process.env.BASE_URL
      }
    });
    // Create the RAG Application
    const app = await new RAGApplicationBuilder()
    .setStore(new LibSqlStore({ path: './data.db' }))
    .setVectorDatabase(new LibSqlDb({ path: './data.db' }))
    .setEmbeddingModel(customEmbeddings)
    .setModel(customBaseModel)
    .build();

   await app.addLoader(new WebLoader({ urlOrContent: 'https://github.com/TencentCloud/tencentcloud-sdk-nodejs/issues/160' }));
   const response = await app.query('如何评价腾讯云nodejs的打包服务？');
   console.log(response.content);
}

async function testViem() {
  const primaryKey = process.env.ETH_PRIVATE_KEY ?? "";
  // convert to hex
  if (!primaryKey) {
    throw new Error("缺少 ETH_PRIVATE_KEY 环境变量");
  }
  
  // 如果私钥字符串不以 "0x" 开头，则手动添加，并通过类型断言转换为 Hex 类型
  const primaryKeyHex = primaryKey as Address;
  const account = privateKeyToAccount(primaryKeyHex);
  const client = createWalletClient({
    chain: sepolia, 
    transport: http("https://sepolia.infura.io/v3/2c0315e866694b5f8855f369ba30a4b0"), 
  });

  const hash = await client.sendTransaction({
    account,
    to: '0xc4d6c15db36b92dc4776d2ead5dd31df86202a3b',
    value: parseEther('0.001'),
  });

  console.log(hash);
}

export { testSwarmAgent, testCompletion, testRAGApp, testViem };