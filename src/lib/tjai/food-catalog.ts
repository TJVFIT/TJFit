import type {TjaiUserProfile} from '@/lib/tjai-types';
import type {Locale} from '@/lib/i18n';
type Food={names:readonly string[];macros:readonly[number,number,number,number]};
export const foodCatalog:Record<string,Food>={
 chicken:{names:['Cooked chicken; halal if required','Pişmiş tavuk; gerekiyorsa helal','دجاج مطبوخ؛ حلال عند الحاجة','Pollo cocido; halal si procede','Poulet cuit ; halal si nécessaire'],macros:[165,31,0,3.6]},
 eggs:{names:['Cooked eggs','Pişmiş yumurta','بيض مطبوخ','Huevos cocidos','Œufs cuits'],macros:[155,13,1.1,11]},
 fish:{names:['Cooked white fish','Pişmiş beyaz balık','سمك أبيض مطبوخ','Pescado blanco cocido','Poisson blanc cuit'],macros:[110,24,0,1.2]},
 tofu:{names:['Plain tofu','Sade tofu','توفو سادة','Tofu natural','Tofu nature'],macros:[144,17,3,9]},
 lentils:{names:['Cooked lentils','Pişmiş mercimek','عدس مطبوخ','Lentejas cocidas','Lentilles cuites'],macros:[116,9,20,0.4]},
 yogurt:{names:['Plain Greek yogurt','Sade süzme yoğurt','لبن يوناني سادة','Yogur griego natural','Yaourt grec nature'],macros:[73,10,4,2]},
 rice:{names:['Cooked rice','Pişmiş pirinç','أرز مطبوخ','Arroz cocido','Riz cuit'],macros:[130,2.7,28,0.3]},
 potato:{names:['Boiled potato','Haşlanmış patates','بطاطا مسلوقة','Patata cocida','Pomme de terre cuite'],macros:[87,1.9,20,0.1]},
 oats:{names:['Dry oats','Kuru yulaf','شوفان جاف','Avena seca','Flocons d’avoine secs'],macros:[389,16.9,66.3,6.9]},
 carrot:{names:['Cooked carrots','Pişmiş havuç','جزر مطبوخ','Zanahoria cocida','Carottes cuites'],macros:[35,0.8,8,0.2]},
 apple:{names:['Apple','Elma','تفاح','Manzana','Pomme'],macros:[52,0.3,14,0.2]},
 oil:{names:['Olive oil','Zeytinyağı','زيت زيتون','Aceite de oliva','Huile d’olive'],macros:[884,0,0,100]}
};
const index:Record<Locale,number>={en:0,tr:1,ar:2,es:3,fr:4};
export const foodName=(id:string,locale:Locale)=>foodCatalog[id].names[index[locale]];
export function allowedFoods(p:TjaiUserProfile){
 const vegan=p.dietStyle==='vegan'||p.dietaryRestrictions.includes('vegan'),vegetarian=vegan||p.dietStyle==='vegetarian'||p.dietaryRestrictions.includes('vegetarian');
 const protein=['chicken','eggs','fish','tofu','lentils','yogurt'].filter(id=>{
  if(vegetarian&&['chicken','fish'].includes(id))return false;
  if(vegan&&['eggs','yogurt'].includes(id))return false;
  if(vegetarian&&p.plantProteinSources?.length){
   if(id==='tofu'&&!p.plantProteinSources.includes('tofu_tempeh'))return false;
   if(id==='lentils'&&!p.plantProteinSources.includes('legumes'))return false;
   if(['eggs','yogurt'].includes(id)&&!p.plantProteinSources.includes('dairy_eggs'))return false;
  }
  if(id==='yogurt'&&(p.dietaryRestrictions.includes('dairy_free')||p.avoidedFoods.includes('dairy')))return false;
  if(id==='eggs'&&p.avoidedFoods.includes('eggs'))return false;
  if(id==='fish'&&p.avoidedFoods.includes('seafood'))return false;
  return true;
 });
 const carbs=['rice','potato','oats'].filter(id=>id!=='oats'||!p.dietaryRestrictions.includes('gluten_free'));
 return {protein,carbs};
}
