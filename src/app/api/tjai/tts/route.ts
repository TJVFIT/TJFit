import {NextResponse} from 'next/server';
export async function POST(){return NextResponse.json({error:'Voice playback is unavailable.',code:'TJAI_FEATURE_DISABLED'},{status:503});}
