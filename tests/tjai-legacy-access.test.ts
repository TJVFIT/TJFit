import {describe,expect,it} from 'vitest';
import {getTjaiLegacyAccess} from '../src/lib/tjai/legacy-access';
function client({purchase=false,role='customer',tier='core',status='active',error=false}: {purchase?:boolean;role?:string;tier?:string;status?:string;error?:boolean}={}){
 const results:Record<string,unknown>={tjai_plan_purchases:{data:purchase?[{id:'old-purchase'}]:[],error:null},profiles:{data:{role},error:error?{message:'unavailable'}:null},user_subscriptions:{data:{tier,status},error:null}};
 return {from:(table:string)=>({select:()=>({eq:()=>({limit:()=>Promise.resolve(results[table]),maybeSingle:()=>Promise.resolve(results[table])})})})} as never;
}
describe('historical generation access sources',()=>{
 it.each([{purchase:true},{role:'admin'},{tier:'pro'},{tier:'apex'},{tier:'pro',status:'trialing'}])('preserves qualifying historical source %j',async state=>{expect(await getTjaiLegacyAccess(client(state),'user')).toEqual({available:true,hasAccess:true});});
 it('never grants legacy access to a new-pass-only customer',async()=>{expect(await getTjaiLegacyAccess(client(),'user')).toEqual({available:true,hasAccess:false});});
 it('revokes canceled subscription access while accepting another surviving historical source',async()=>{expect((await getTjaiLegacyAccess(client({tier:'pro',status:'canceled'}),'user')).hasAccess).toBe(false);expect((await getTjaiLegacyAccess(client({purchase:true,tier:'pro',status:'canceled'}),'user')).hasAccess).toBe(true);});
 it('fails closed if a historical entitlement source cannot be checked',async()=>{expect(await getTjaiLegacyAccess(client({purchase:true,error:true}),'user')).toEqual({available:false,hasAccess:false});});
});
