import {jsPDF} from 'jspdf';
import {ARABIC_PDF_FONT,LATIN_PDF_FONT} from './pdf-fonts';
import type {TJAIPlan,TJAIMetrics} from '@/lib/tjai-types';
import type {Locale} from '@/lib/i18n';
const labels:Record<Locale,string[]>={en:['Your TJAI plan','Daily targets','Training','Nutrition','Weeks','Calories','Protein','Carbohydrates','Fat','Water','Estimated meal values. Record actual portions in your log.','reps','rest'],tr:['TJAI planın','Günlük hedefler','Antrenman','Beslenme','Hafta','Kalori','Protein','Karbonhidrat','Yağ','Su','Öğün değerleri tahminidir. Gerçek porsiyonları günlüğüne kaydet.','tekrar','dinlenme'],ar:['خطة TJAI الخاصة بك','الأهداف اليومية','التدريب','التغذية','الأسابيع','السعرات','البروتين','الكربوهيدرات','الدهون','الماء','قيم الوجبات تقديرية. سجل حصصك الفعلية في اليوميات.','تكرارات','راحة'],es:['Tu plan TJAI','Objetivos diarios','Entrenamiento','Nutrición','Semanas','Calorías','Proteína','Carbohidratos','Grasa','Agua','Valores estimados. Registra las porciones reales en tu diario.','repeticiones','descanso'],fr:['Votre plan TJAI','Objectifs quotidiens','Entraînement','Nutrition','Semaines','Calories','Protéines','Glucides','Lipides','Eau','Valeurs estimées. Notez les portions réelles dans votre journal.','répétitions','repos']};
export function buildUnicodeTjaiPdf({plan,metrics,locale,createdAt}:{plan:TJAIPlan;metrics:TJAIMetrics;locale:Locale;createdAt:string}){
 const pdf=new jsPDF({unit:'pt',format:'a4',compress:true});
 pdf.addFileToVFS('Tjai.ttf',locale==='ar'?ARABIC_PDF_FONT:LATIN_PDF_FONT);pdf.addFont('Tjai.ttf','Tjai','normal');pdf.setFont('Tjai','normal');
 const rtl=locale==='ar',t=labels[locale],margin=46,width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight();let y=margin,page=1;
 const footer=()=>{pdf.setFontSize(8);pdf.setTextColor(105,105,115);pdf.text('TJAI | '+page,margin,height-25);};
 const next=()=>{footer();pdf.addPage();pdf.setFont('Tjai','normal');page++;y=margin;};
 const line=(value:unknown,size=10,accent=false)=>{
  const text=String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim();if(!text)return;
  pdf.setFontSize(size);pdf.setTextColor(...(accent?[110,55,180]:[30,30,40]) as [number,number,number]);
  const lines=pdf.splitTextToSize(text,width-margin*2) as string[];
  for(const part of lines){if(y+size*1.55>height-50){next();pdf.setFontSize(size);pdf.setTextColor(...(accent?[110,55,180]:[30,30,40]) as [number,number,number]);}
   pdf.text(part,rtl?width-margin:margin,y,{align:rtl?'right':'left',isInputVisual:false,isOutputVisual:true,isInputRtl:rtl&&/[\u0600-\u06ff]/.test(part),isOutputRtl:false});y+=size*1.55;}
 };
 const heading=(value:string)=>{y+=12;line(value,15,true);y+=5;};
 line('TJAI',12,true);line(t[0],24);line(new Date(createdAt).toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'}),9);heading(t[1]);
 line(t[5]+': '+(plan.summary?.calorieTarget??metrics.calorieTarget)+' kcal');
 line(t[6]+': '+(plan.summary?.protein??metrics.protein)+' g | '+t[7]+': '+(plan.summary?.carbs??metrics.carbs)+' g | '+t[8]+': '+(plan.summary?.fat??metrics.fat)+' g');
 line(t[9]+': '+(plan.summary?.water??metrics.water)+' ml');line(plan.summary?.keyInsight);heading(t[2]);line(plan.program?.philosophy);
 for(const week of plan.program?.weeks??[]){heading(t[4]+' '+week.weekRange+' · '+week.phase);line(week.focus,9);for(const day of week.days??[]){heading(day.label);line(day.warmup,9);for(const ex of day.exercises??[]){line(ex.name,11,true);line(ex.sets+' × '+ex.reps+' '+t[11]+' · '+ex.rest+' '+t[12]);line(ex.note,8);}}}
 next();heading(t[3]);line(t[10]);line(plan.diet?.philosophy);
 // Collapse identical daily templates explicitly; keep every distinct meal/day.
 for(const week of plan.diet?.weeks??[]){heading(t[4]+' '+week.weekRange+' · '+week.phase);line(week.adjustment,9);const groups=new Map<string,{labels:string[];day:(typeof week.days)[number]}>();
  for(const day of week.days??[]){const key=JSON.stringify(day.meals);const existing=groups.get(key);if(existing)existing.labels.push(day.label);else groups.set(key,{labels:[day.label],day});}
  for(const group of groups.values()){heading(group.labels.join(' · '));for(const meal of group.day.meals??[]){line(meal.name+' · '+meal.time,11,true);for(const food of meal.foods??[])line(food);line(meal.calories+' kcal | '+t[6]+': '+meal.protein+' g | '+t[7]+': '+meal.carbs+' g | '+t[8]+': '+meal.fat+' g',8);line(meal.prepNote,8);y+=5;}}
 }
 footer();return pdf;
}
