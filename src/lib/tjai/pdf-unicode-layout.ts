import type {jsPDF} from 'jspdf';
import {ARABIC_PDF_FONT,LATIN_PDF_FONT} from './pdf-fonts';
const missingGlyphs=new WeakMap<jsPDF,Set<number>>();
export function pdfMissingGlyphs(pdf:jsPDF){return [...(missingGlyphs.get(pdf)??[])];}
/** Preserve the established page layout while embedding Unicode fonts and mirroring RTL text columns. */
export function configureUnicodePdf(pdf:jsPDF,locale:string){
 const rtl=locale==='ar';
 missingGlyphs.set(pdf,new Set());
 pdf.addFileToVFS('TjaiUnicode.ttf',rtl?ARABIC_PDF_FONT:LATIN_PDF_FONT);
 for(const style of ['normal','bold','italic','bolditalic'])pdf.addFont('TjaiUnicode.ttf','helvetica',style);
 pdf.setFont('helvetica','normal');
 const original=pdf.text.bind(pdf);
 pdf.text=((text:any,x:any,y:any,options:any={},...rest:any[])=>{
  const opts=typeof options==='object'&&options?{...options}:{};
  const clean=(v:any):any=>typeof v==='string'?v.replace(/☐/g,'[ ]').replace(/→/g,'->').replace(/←/g,'<-'):Array.isArray(v)?v.map(clean):v;
  if(rtl&&typeof x==='number'){
   x=pdf.internal.pageSize.getWidth()-x;
   opts.align=opts.align==='right'?'left':opts.align==='center'?'center':'right';
  }
  const content=clean(text),fontSize=pdf.getFontSize();
  const flattened=typeof content==='string'?content:JSON.stringify(content);
  const font=pdf.getFont().metadata as any;
  for(const ch of flattened){const cp=ch.codePointAt(0)!;if(cp>32&&font.characterToGlyph?.(cp)===0)missingGlyphs.get(pdf)?.add(cp);}
  // Some established headings were laid out as one line. Keep the full title inside the page.
  if(typeof content==='string'&&typeof x==='number'){
   const pageWidth=pdf.internal.pageSize.getWidth(),available=opts.align==='right'?x-46:opts.align==='center'?2*Math.min(x-46,pageWidth-46-x):pageWidth-46-x;
   const natural=pdf.getTextWidth(content);
   if(available>0&&natural>available)pdf.setFontSize(fontSize*available/natural);
  }
  try{return (original as any)(content,x,y,{...opts,isInputVisual:false,isOutputVisual:true,isInputRtl:rtl&&/[\u0600-\u06ff]/.test(flattened),isOutputRtl:false},...rest);}finally{pdf.setFontSize(fontSize);}
 }) as typeof pdf.text;
 return pdf;
}
