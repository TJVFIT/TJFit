import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/require-auth';
import {getSupabaseServerClient} from '@/lib/supabase-server';
import {getTjaiServerAccess} from '@/lib/tjai/server-access';
export async function GET(){const auth=await requireAuth();if(!auth.ok)return auth.response;const admin=getSupabaseServerClient();if(!admin)return NextResponse.json({error:'unavailable'},{status:503});const access=await getTjaiServerAccess(admin,auth.user.id);return NextResponse.json(access,{status:access.available?200:503,headers:{'Cache-Control':'no-store'}});}
