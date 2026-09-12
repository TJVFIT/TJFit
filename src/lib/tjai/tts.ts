import type {TjaiPersona} from './persona';
export type TtsResult={audioBase64:string;cached:boolean;voiceId:string;bytes:number;costUsd:number};
export function voiceIdForPersona(_persona:TjaiPersona):string{return '';}
export async function synthesizeSpeech(_input:{text:string;persona:TjaiPersona;userId?:string|null;route?:string}):Promise<TtsResult>{throw new Error('TJAI_FEATURE_DISABLED');}
