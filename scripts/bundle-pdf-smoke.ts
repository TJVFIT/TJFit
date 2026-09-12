import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {BUNDLES,getBundle} from '../src/lib/bundles';
import {localizeBundle} from '../src/lib/bundle-localization';
import {buildBundlePdf} from '../src/lib/bundle-pdf-builder';
import {pdfMissingGlyphs} from '../src/lib/tjai/pdf-unicode-layout';
import type {Locale} from '../src/lib/i18n';
const output=process.argv[2];if(!output)throw new Error('Output directory required');mkdirSync(output,{recursive:true});
for(const bundle of BUNDLES.filter(b=>!b.isFree)){for(const locale of ['en','tr','ar','es','fr'] as Locale[]){const enriched=getBundle(bundle.slug)??bundle;const pdf=buildBundlePdf({bundle:enriched,copy:localizeBundle(enriched,locale),locale,issuedAt:'2026-09-12T00:00:00Z'});writeFileSync(join(output,bundle.slug+'-'+locale+'.pdf'),Buffer.from(pdf.output('arraybuffer')));console.log(bundle.slug+'/'+locale+': '+pdf.getNumberOfPages()+' missingGlyphs='+pdfMissingGlyphs(pdf).join(','));}}
