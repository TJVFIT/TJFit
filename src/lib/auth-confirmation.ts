import type {Locale} from '@/lib/i18n';
import {sanitizeRedirectParam} from '@/lib/safe-redirect';

export function authConfirmationNext(locale:Locale,raw:string|null|undefined):string {
 const next=sanitizeRedirectParam(raw,locale);
 // A callback must terminate on an application page, never exchange again.
 if(!next||decodeURIComponent(new URL(next,'https://redirect.invalid').pathname)===`/${locale}/auth/callback`)return `/${locale}/dashboard`;
 return next;
}
export function authConfirmationUrl(origin:string,locale:Locale,next:string|null|undefined):string {
 const url=new URL(`/${locale}/auth/callback`,origin);
 url.searchParams.set('next',authConfirmationNext(locale,next));
 return url.toString();
}

const copy={
 en:{failed:'We could not finish verification. Open the latest email link in the same browser you used to register, or sign in after confirming your email. Request a new link if needed.',assessment:'Keep this tab open. After verifying your email, return here and choose “Back to sign in” to save your assessment. Your answers stay only in the original tab for up to two hours.'},
 tr:{failed:'Doğrulama tamamlanamadı. Son e-postadaki bağlantıyı kayıt olduğun tarayıcıda aç veya e-postanı doğruladıktan sonra giriş yap. Gerekirse yeni bağlantı iste.',assessment:'Bu sekmeyi açık tut. E-postanı doğruladıktan sonra buraya dön ve yanıtlarını kaydetmek için “Girişe dön” seçeneğini kullan. Yanıtların yalnızca ilk sekmede en fazla iki saat saklanır.'},
 ar:{failed:'تعذّر إكمال التحقق. افتح أحدث رابط بريد في المتصفح الذي سجّلت منه، أو سجّل الدخول بعد تأكيد بريدك. اطلب رابطاً جديداً عند الحاجة.',assessment:'اترك علامة التبويب هذه مفتوحة. بعد تأكيد بريدك، عد إلى هنا واختر «العودة لتسجيل الدخول» لحفظ إجاباتك. تبقى الإجابات في علامة التبويب الأصلية فقط لمدة ساعتين كحد أقصى.'},
 es:{failed:'No pudimos completar la verificación. Abre el enlace más reciente en el navegador donde te registraste, o inicia sesión después de confirmar tu correo. Solicita otro enlace si hace falta.',assessment:'Mantén esta pestaña abierta. Tras verificar tu correo, vuelve aquí y elige «Volver al inicio de sesión» para guardar tus respuestas. Solo se conservan en la pestaña original durante un máximo de dos horas.'},
 fr:{failed:'La vérification a échoué. Ouvrez le dernier lien reçu dans le navigateur utilisé pour vous inscrire, ou connectez-vous après confirmation de votre e-mail. Demandez un nouveau lien si nécessaire.',assessment:'Gardez cet onglet ouvert. Après confirmation de votre e-mail, revenez ici et choisissez «Retour à la connexion» pour enregistrer vos réponses. Elles restent uniquement dans l’onglet d’origine pendant deux heures au maximum.'}
};
export const getAuthConfirmationCopy=(locale:Locale)=>copy[locale];
