import {POST} from '../export-pdf/route';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){const locale=new URL(request.url).searchParams.get('locale')??'en';return POST(new Request(request.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({locale})}));}
