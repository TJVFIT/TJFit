import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {compactContext,expandCompactPlan} from '../src/lib/tjai/compact-plan';
import {validateAdultIntake} from '../src/lib/tjai/intake-validation';
import {buildUnicodeTjaiPdf} from '../src/lib/tjai/unicode-pdf';
import type {Locale} from '../src/lib/i18n';
const output=process.argv[2];if(!output)throw new Error('Output directory required');mkdirSync(output,{recursive:true});
for(const locale of ['en','tr','ar','es','fr'] as Locale[]){const checked=validateAdultIntake({s1_age:29,s1_height:175,s1_weight:80,s5_days:4,s11_meals:3,s5_type:'home',s5_equipment:['bodyweight']},locale);if(!checked.ok)throw new Error(checked.error);const a=checked.answers,c=compactContext(a);const {plan,metrics}=expandCompactPlan({days:Array.from({length:c.profile.trainingDays},()=>c.allowed.slice(0,4)),meals:[{protein:'chicken',carbs:'rice'},{protein:'fish',carbs:'potato'},{protein:'eggs',carbs:'oats'}]},a);const pdf=buildUnicodeTjaiPdf({plan,metrics,locale,createdAt:'2026-09-12T12:00:00Z'});writeFileSync(join(output,locale+'.pdf'),Buffer.from(pdf.output('arraybuffer')));console.log(locale+': '+pdf.getNumberOfPages()+' pages');}
