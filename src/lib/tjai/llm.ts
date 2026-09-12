import type {OpenAIUsageSnapshot} from '@/lib/tjai-openai';
import {callFreeGroq} from './free-provider';
import {isTaskAvailable,type TjaiAiTask} from './provider-policy';
type Input={task:TjaiAiTask;system:string;user:string;maxTokens?:number;jsonMode?:boolean;route?:string;userId?:string|null;openaiModel?:string;onUsage?:(usage:OpenAIUsageSnapshot)=>void};
export async function llmCall(input:Input):Promise<string>{if(!isTaskAvailable(input.task))throw new Error('TJAI_PROVIDER_UNAVAILABLE');return callFreeGroq(input);}
export async function llmStream(input:{task:TjaiAiTask;system:string;user?:string;messages?:Array<{role:'user'|'assistant';content:string}>;maxTokens?:number}):Promise<ReadableStream<Uint8Array>>{
 if(!isTaskAvailable(input.task))throw new Error('TJAI_PROVIDER_UNAVAILABLE');
 const content=await callFreeGroq(input);const encoder=new TextEncoder();
 return new ReadableStream({start(controller){controller.enqueue(encoder.encode('data: '+JSON.stringify({choices:[{delta:{content}}]})+'\n\ndata: [DONE]\n\n'));controller.close();}});
}
