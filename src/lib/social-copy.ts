import type { Locale } from "@/lib/i18n";

export type SocialCopy = {
  peopleSearchTitle: string;
  peopleSearchSubtitle: string;
  searchPlaceholder: string;
  searchHint: string;
  searchPrivacyNote: string;
  searchStartPrompt: string;
  searchStartDetail: string;
  noResults: string;
  loading: string;
  errorGeneric: string;
  openProfile: string;
  startChat: string;
  profileNotFound: string;
  privateProfile: string;
  profilePublic: string;
  messagingBlocked: string;
  cannotMessageSelf: string;
  roleCoach: string;
  roleAdmin: string;
  roleUser: string;
  backToSearch: string;
  messageSettingsTitle: string;
  messageSettingsSubtitle: string;
  usernameLabel: string;
  usernameHint: string;
  displayNameLabel: string;
  avatarUrlLabel: string;
  bioLabel: string;
  accountVisibilityLabel: string;
  visibilityPublic: string;
  visibilityPrivate: string;
  searchableLabel: string;
  searchableHelp: string;
  messagePrivacyLabel: string;
  privacyEveryone: string;
  privacyNobody: string;
  privacyStaff: string;
  privacyConnections: string;
  privacyApproved: string;
  saveProfile: string;
  saving: string;
  saved: string;
  inboxSelectChat: string;
  newChatTitle: string;
  newChatPlaceholder: string;
  newChatButton: string;
  coachChatShortcut: string;
  openCoachChat: string;
  conversationCoach: string;
  conversationDirect: string;
  threadBack: string;
  settingsLink: string;
  profileEditPageTitle: string;
  memberSinceLabel: string;
  lastUpdatedLabel: string;
  loginRequiredTitle: string;
  loginRequiredBody: string;
  viewProfileButton: string;
  signInToMessage: string;
  retryLabel: string;
  usernameInvalidClient: string;
  profileChooseUsernameHint: string;
  chatSessionUnavailable: string;
  threadParticipantUnknown: string;
  profileReloadHint: string;
};

const socialCopy: Record<Locale, SocialCopy> = {
  en: {
    peopleSearchTitle: "Find people",
    peopleSearchSubtitle: "Search by username or display name. Results respect privacy settings.",
    searchPlaceholder: "Search username or name…",
    searchHint: "Type at least 2 characters.",
    searchPrivacyNote:
      "Only members who turned on search can appear. Private accounts never show bios in this list — messaging follows their message settings.",
    searchStartPrompt: "Search the community",
    searchStartDetail: "Enter part of a username or display name. Results update as you type.",
    noResults: "No one matches that search.",
    loading: "Loading…",
    errorGeneric: "Something went wrong. Try again.",
    openProfile: "Profile",
    startChat: "Message",
    profileNotFound: "This profile does not exist.",
    privateProfile: "Private account",
    profilePublic: "Public profile",
    messagingBlocked: "Messaging is not available based on their settings.",
    cannotMessageSelf: "You cannot start a chat with yourself.",
    roleCoach: "Coach",
    roleAdmin: "Admin",
    roleUser: "Member",
    backToSearch: "Back to search",
    messageSettingsTitle: "Profile & messaging",
    messageSettingsSubtitle: "Username, visibility, and who can message you.",
    usernameLabel: "Username",
    usernameHint: "3–20 characters: letters, numbers, underscore, dot.",
    displayNameLabel: "Display name",
    avatarUrlLabel: "Avatar URL",
    bioLabel: "Bio",
    accountVisibilityLabel: "Account visibility",
    visibilityPublic: "Public — full profile when allowed",
    visibilityPrivate: "Private — limited view for others",
    searchableLabel: "Appear in username search",
    searchableHelp: "When off, you will not show up in member search.",
    messagePrivacyLabel: "Who can message me",
    privacyEveryone: "Everyone",
    privacyNobody: "Nobody",
    privacyStaff: "Coaches & admins only",
    privacyConnections: "My coach connections only",
    privacyApproved: "Approved people only",
    saveProfile: "Save changes",
    saving: "Saving…",
    saved: "Saved.",
    inboxSelectChat: "Select a conversation or start a new chat.",
    newChatTitle: "New message",
    newChatPlaceholder: "Username",
    newChatButton: "Start chat",
    coachChatShortcut: "Your coach",
    openCoachChat: "Open",
    conversationCoach: "Coach",
    conversationDirect: "Direct",
    threadBack: "Inbox",
    settingsLink: "Messaging settings",
    profileEditPageTitle: "Edit profile",
    memberSinceLabel: "Member since",
    lastUpdatedLabel: "Last updated",
    loginRequiredTitle: "Sign in to continue",
    loginRequiredBody: "Log in or create an account to search members, open profiles, and send messages.",
    viewProfileButton: "View profile",
    signInToMessage: "Sign in to message",
    retryLabel: "Try again",
    usernameInvalidClient: "Use 3–20 characters: letters, numbers, underscore, or dot only.",
    profileChooseUsernameHint: "Choose a username so your public profile link works and others can find you.",
    chatSessionUnavailable: "Messaging could not start in this session. Refresh the page or check your connection.",
    threadParticipantUnknown: "Could not load this chat participant.",
    profileReloadHint: "We could not load your profile. Check your connection and try again."
  },
  tr: {
    peopleSearchTitle: "Kisileri bul",
    peopleSearchSubtitle: "Kullanici adi veya gorunen ada gore ara. Sonuclar gizlilik kurallarina uyar.",
    searchPlaceholder: "Kullanici adi veya isim…",
    searchHint: "En az 2 karakter girin.",
    searchPrivacyNote:
      "Aramayi acan uyeler gorunur. Gizli hesaplarin ozeti burada gosterilmez; mesajlasma ayarlari uygulanir.",
    searchStartPrompt: "Toplulukta ara",
    searchStartDetail: "Kullanici adi veya gorunen adin bir kismini yazin; sonuclar yazdikca guncellenir.",
    noResults: "Eslesen kisi yok.",
    loading: "Yukleniyor…",
    errorGeneric: "Bir sorun oldu. Tekrar deneyin.",
    openProfile: "Profil",
    startChat: "Mesaj",
    profileNotFound: "Bu profil bulunamadi.",
    privateProfile: "Gizli hesap",
    profilePublic: "Herkese acik profil",
    messagingBlocked: "Ayarlarina gore mesajlasma acik degil.",
    cannotMessageSelf: "Kendinizle sohbet baslatamazsiniz.",
    roleCoach: "Koc",
    roleAdmin: "Yonetici",
    roleUser: "Uye",
    backToSearch: "Aramaya don",
    messageSettingsTitle: "Profil ve mesajlasma",
    messageSettingsSubtitle: "Kullanici adi, gorunurluk ve kimler yazabilir.",
    usernameLabel: "Kullanici adi",
    usernameHint: "3–20 karakter: harf, rakam, alt cizgi, nokta.",
    displayNameLabel: "Gorunen ad",
    avatarUrlLabel: "Avatar URL",
    bioLabel: "Biyografi",
    accountVisibilityLabel: "Hesap gorunurlugu",
    visibilityPublic: "Herkese acik",
    visibilityPrivate: "Gizli — baskalari sinirli gorur",
    searchableLabel: "Kullanici aramasinda gorun",
    searchableHelp: "Kapaliysa arama sonuclarinda cikmazsiniz.",
    messagePrivacyLabel: "Kimler mesaj atabilir",
    privacyEveryone: "Herkes",
    privacyNobody: "Kimse",
    privacyStaff: "Sadece koç ve yonetici",
    privacyConnections: "Sadece koç baglantilarim",
    privacyApproved: "Sadece onayladiklarim",
    saveProfile: "Kaydet",
    saving: "Kaydediliyor…",
    saved: "Kaydedildi.",
    inboxSelectChat: "Bir sohbet secin veya yeni baslatin.",
    newChatTitle: "Yeni mesaj",
    newChatPlaceholder: "Kullanici adi",
    newChatButton: "Sohbet baslat",
    coachChatShortcut: "Kocunuz",
    openCoachChat: "Ac",
    conversationCoach: "Koc",
    conversationDirect: "Direkt",
    threadBack: "Gelen kutusu",
    settingsLink: "Mesaj ayarlari",
    profileEditPageTitle: "Profili duzenle",
    memberSinceLabel: "Uyelik tarihi",
    lastUpdatedLabel: "Son guncelleme",
    loginRequiredTitle: "Devam etmek icin giris yapin",
    loginRequiredBody: "Uyeleri aramak, profilleri acmak ve mesaj gondermek icin giris yapin veya hesap olusturun.",
    viewProfileButton: "Profili gor",
    signInToMessage: "Mesaj icin giris yap",
    retryLabel: "Tekrar dene",
    usernameInvalidClient: "3–20 karakter: sadece harf, rakam, alt cizgi veya nokta.",
    profileChooseUsernameHint: "Herkese acik profil baglantisi icin bir kullanici adi secin.",
    chatSessionUnavailable: "Mesajlasma bu oturumda baslamadi. Sayfayi yenileyin veya baglantiyi kontrol edin.",
    threadParticipantUnknown: "Sohbet kisisi yuklenemedi.",
    profileReloadHint: "Profilin yuklenemedi. Baglantiyi kontrol edip tekrar deneyin."
  },
  ar: {
    peopleSearchTitle: "البحث عن أشخاص",
    peopleSearchSubtitle: "ابحث بالاسم أو اسم المستخدم. تُطبّق إعدادات الخصوصية.",
    searchPlaceholder: "ابحث…",
    searchHint: "أدخل حرفين على الأقل.",
    searchPrivacyNote:
      "يظهر من فعّل الظهور في البحث فقط. لا نعرض نبذة الحسابات الخاصة هنا؛ المراسلة وفق إعدادات الطرف الآخر.",
    searchStartPrompt: "ابحث في المجتمع",
    searchStartDetail: "اكتب جزءاً من اسم المستخدم أو الاسم الظاهر. تتحدث النتائج أثناء الكتابة.",
    noResults: "لا توجد نتائج.",
    loading: "جار التحميل…",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    openProfile: "الملف",
    startChat: "مراسلة",
    profileNotFound: "الملف غير موجود.",
    privateProfile: "حساب خاص",
    profilePublic: "ملف عام",
    messagingBlocked: "المراسلة غير متاحة حسب إعداداتهم.",
    cannotMessageSelf: "لا يمكنك بدء محادثة مع نفسك.",
    roleCoach: "مدرب",
    roleAdmin: "مسؤول",
    roleUser: "عضو",
    backToSearch: "العودة للبحث",
    messageSettingsTitle: "الملف والمراسلة",
    messageSettingsSubtitle: "اسم المستخدم والظهور ومن يمكنه المراسلة.",
    usernameLabel: "اسم المستخدم",
    usernameHint: "٣–٢٠ حرفاً: أحرف وأرقام وشرطة سفلية ونقطة.",
    displayNameLabel: "الاسم الظاهر",
    avatarUrlLabel: "رابط الصورة",
    bioLabel: "نبذة",
    accountVisibilityLabel: "ظهور الحساب",
    visibilityPublic: "عام",
    visibilityPrivate: "خاص — عرض محدود",
    searchableLabel: "الظهور في البحث",
    searchableHelp: "عند الإيقاف لن تظهر في نتائج البحث.",
    messagePrivacyLabel: "من يمكنه مراسلتي",
    privacyEveryone: "الجميع",
    privacyNobody: "لا أحد",
    privacyStaff: "المدربون والمسؤولون فقط",
    privacyConnections: "من لهم ارتباط تدريب فقط",
    privacyApproved: "من وافقت لهم فقط",
    saveProfile: "حفظ",
    saving: "جار الحفظ…",
    saved: "تم الحفظ.",
    inboxSelectChat: "اختر محادثة أو ابدأ محادثة جديدة.",
    newChatTitle: "رسالة جديدة",
    newChatPlaceholder: "اسم المستخدم",
    newChatButton: "بدء المحادثة",
    coachChatShortcut: "مدربك",
    openCoachChat: "فتح",
    conversationCoach: "مدرب",
    conversationDirect: "مباشر",
    threadBack: "الوارد",
    settingsLink: "إعدادات المراسلة",
    profileEditPageTitle: "تعديل الملف",
    memberSinceLabel: "عضو منذ",
    lastUpdatedLabel: "آخر تحديث",
    loginRequiredTitle: "سجّل الدخول للمتابعة",
    loginRequiredBody: "سجّل الدخول أو أنشئ حساباً للبحث عن الأعضاء وعرض الملفات وإرسال الرسائل.",
    viewProfileButton: "عرض الملف",
    signInToMessage: "سجّل الدخول للمراسلة",
    retryLabel: "إعادة المحاولة",
    usernameInvalidClient: "٣–٢٠ حرفاً: أحرف وأرقام وشرطة سفلية أو نقطة فقط.",
    profileChooseUsernameHint: "اختر اسماً مستخدماً ليعمل رابط ملفك العلني.",
    chatSessionUnavailable: "تعذر بدء المراسلة في هذه الجلسة. حدّث الصفحة أو تحقق من الاتصال.",
    threadParticipantUnknown: "تعذر تحميل بيانات المشارك.",
    profileReloadHint: "تعذر تحميل ملفك. تحقق من الاتصال وحاول مرة أخرى."
  },
  es: {
    peopleSearchTitle: "Buscar personas",
    peopleSearchSubtitle: "Por usuario o nombre visible. Se respetan la privacidad.",
    searchPlaceholder: "Buscar…",
    searchHint: "Escribe al menos 2 caracteres.",
    searchPrivacyNote:
      "Solo aparecen quienes activaron la busqueda. Las cuentas privadas no muestran bio aqui; los mensajes respetan sus ajustes.",
    searchStartPrompt: "Busca en la comunidad",
    searchStartDetail: "Escribe parte del usuario o nombre visible. Los resultados se actualizan al escribir.",
    noResults: "Sin resultados.",
    loading: "Cargando…",
    errorGeneric: "Algo fallo. Reintenta.",
    openProfile: "Perfil",
    startChat: "Mensaje",
    profileNotFound: "Perfil no encontrado.",
    privateProfile: "Cuenta privada",
    profilePublic: "Perfil publico",
    messagingBlocked: "Mensajes no disponibles por su configuracion.",
    cannotMessageSelf: "No puedes chatear contigo mismo.",
    roleCoach: "Coach",
    roleAdmin: "Admin",
    roleUser: "Miembro",
    backToSearch: "Volver al buscador",
    messageSettingsTitle: "Perfil y mensajes",
    messageSettingsSubtitle: "Usuario, visibilidad y quien puede escribirte.",
    usernameLabel: "Usuario",
    usernameHint: "3–20 caracteres: letras, numeros, _ y .",
    displayNameLabel: "Nombre visible",
    avatarUrlLabel: "URL del avatar",
    bioLabel: "Bio",
    accountVisibilityLabel: "Visibilidad",
    visibilityPublic: "Publico",
    visibilityPrivate: "Privado — vista limitada",
    searchableLabel: "Aparecer en busqueda",
    searchableHelp: "Si esta desactivado, no apareces en busquedas.",
    messagePrivacyLabel: "Quien puede escribirme",
    privacyEveryone: "Todos",
    privacyNobody: "Nadie",
    privacyStaff: "Solo coaches y admins",
    privacyConnections: "Solo mis vinculos coach",
    privacyApproved: "Solo personas aprobadas",
    saveProfile: "Guardar",
    saving: "Guardando…",
    saved: "Guardado.",
    inboxSelectChat: "Elige una conversacion o inicia una nueva.",
    newChatTitle: "Nuevo mensaje",
    newChatPlaceholder: "Usuario",
    newChatButton: "Iniciar chat",
    coachChatShortcut: "Tu coach",
    openCoachChat: "Abrir",
    conversationCoach: "Coach",
    conversationDirect: "Directo",
    threadBack: "Bandeja",
    settingsLink: "Ajustes de mensajes",
    profileEditPageTitle: "Editar perfil",
    memberSinceLabel: "Miembro desde",
    lastUpdatedLabel: "Ultima actualizacion",
    loginRequiredTitle: "Inicia sesion para continuar",
    loginRequiredBody: "Entra o crea una cuenta para buscar miembros, ver perfiles y enviar mensajes.",
    viewProfileButton: "Ver perfil",
    signInToMessage: "Inicia sesion para escribir",
    retryLabel: "Reintentar",
    usernameInvalidClient: "3–20 caracteres: solo letras, numeros, guion bajo o punto.",
    profileChooseUsernameHint: "Elige un usuario para que tu enlace publico funcione.",
    chatSessionUnavailable: "No se pudo iniciar el chat en esta sesion. Recarga o revisa la conexion.",
    threadParticipantUnknown: "No se pudo cargar el participante del chat.",
    profileReloadHint: "No se pudo cargar tu perfil. Revisa la conexion e intentalo de nuevo."
  },
  fr: {
    peopleSearchTitle: "Trouver des personnes",
    peopleSearchSubtitle: "Par pseudo ou nom. Le respect de la vie privee est applique.",
    searchPlaceholder: "Rechercher…",
    searchHint: "Au moins 2 caracteres.",
    searchPrivacyNote:
      "Seuls les membres ayant active la recherche apparaissent. Pas de bio pour les comptes prives ici; la messagerie suit leurs reglages.",
    searchStartPrompt: "Parcourir la communaute",
    searchStartDetail: "Saisissez une partie du pseudo ou du nom affiche. Les resultats se mettent a jour en direct.",
    noResults: "Aucun resultat.",
    loading: "Chargement…",
    errorGeneric: "Une erreur est survenue.",
    openProfile: "Profil",
    startChat: "Message",
    profileNotFound: "Profil introuvable.",
    privateProfile: "Compte prive",
    profilePublic: "Profil public",
    messagingBlocked: "Messagerie indisponible selon leurs reglages.",
    cannotMessageSelf: "Vous ne pouvez pas discuter avec vous-meme.",
    roleCoach: "Coach",
    roleAdmin: "Admin",
    roleUser: "Membre",
    backToSearch: "Retour a la recherche",
    messageSettingsTitle: "Profil et messagerie",
    messageSettingsSubtitle: "Pseudo, visibilite et qui peut vous ecrire.",
    usernameLabel: "Nom d'utilisateur",
    usernameHint: "3–20 caracteres : lettres, chiffres, _ et .",
    displayNameLabel: "Nom affiche",
    avatarUrlLabel: "URL de l'avatar",
    bioLabel: "Bio",
    accountVisibilityLabel: "Visibilite du compte",
    visibilityPublic: "Public",
    visibilityPrivate: "Prive — apercu limite",
    searchableLabel: "Apparaitre dans la recherche",
    searchableHelp: "Si desactive, vous n'apparaissez pas dans les recherches.",
    messagePrivacyLabel: "Qui peut m'ecrire",
    privacyEveryone: "Tout le monde",
    privacyNobody: "Personne",
    privacyStaff: "Coachs et admins seulement",
    privacyConnections: "Mes liens coach seulement",
    privacyApproved: "Personnes approuvees seulement",
    saveProfile: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Enregistre.",
    inboxSelectChat: "Choisissez une conversation ou demarrez-en une.",
    newChatTitle: "Nouveau message",
    newChatPlaceholder: "Pseudo",
    newChatButton: "Demarrer",
    coachChatShortcut: "Votre coach",
    openCoachChat: "Ouvrir",
    conversationCoach: "Coach",
    conversationDirect: "Direct",
    threadBack: "Boite de reception",
    settingsLink: "Reglages messagerie",
    profileEditPageTitle: "Modifier le profil",
    memberSinceLabel: "Membre depuis",
    lastUpdatedLabel: "Derniere mise a jour",
    loginRequiredTitle: "Connectez-vous pour continuer",
    loginRequiredBody: "Connectez-vous ou creez un compte pour chercher des membres, voir les profils et envoyer des messages.",
    viewProfileButton: "Voir le profil",
    signInToMessage: "Se connecter pour ecrire",
    retryLabel: "Reessayer",
    usernameInvalidClient: "3–20 caracteres : lettres, chiffres, underscore ou point uniquement.",
    profileChooseUsernameHint: "Choisissez un pseudo pour activer votre lien de profil public.",
    chatSessionUnavailable: "Impossible de demarrer la messagerie sur cette session. Actualisez ou verifiez la connexion.",
    threadParticipantUnknown: "Impossible de charger ce participant.",
    profileReloadHint: "Profil introuvable. Verifiez la connexion et reessayez."
  }
};

export function getSocialCopy(locale: Locale): SocialCopy {
  return socialCopy[locale];
}
