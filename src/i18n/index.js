// Presentation-only localization. Stored exercise IDs, user notes and workout data
// deliberately remain language-neutral and are never translated in localStorage.
export const LANGUAGES=Object.freeze({en:'English',es:'Español',tr:'Türkçe'});
export const languageOf=value=>Object.hasOwn(LANGUAGES,value)?value:'en';
const phrases={
 'Ana Sayfa':['Home','Inicio'],
 'Programlar':['Programs','Programas'],
 'Geçmiş':['History','Historial'],
 'İlerleme':['Progress','Progreso'],
 'Ayarlar':['Settings','Ajustes'],
 'Bugünkü Antrenman':["Today's Workout",'Entrenamiento de hoy'],
 'Antrenmanı Başlat':['Start Workout','Iniciar entrenamiento'],
 'Antrenmana Devam Et':['Resume Workout','Continuar entrenamiento'],
 'Yaklaşan Antrenmanlar':['Upcoming Workouts','Próximos entrenamientos'],
 'Günaydın':['Good morning','Buenos días'],
 'İyi günler':['Good afternoon','Buenas tardes'],
 'İyi akşamlar':['Good evening','Buenas noches'],
 'Toplam':['Total','Total'],
 'Bu hafta':['This week','Esta semana'],
 'Hacim':['Volume','Volumen'],
 'Günlük':['Daily','Diario'],
 'Antrenman':['Workout','Entrenamiento'],
 'Antrenman A':['Workout A','Entrenamiento A'],
 'Antrenman B':['Workout B','Entrenamiento B'],
 'Antrenman 1':['Workout 1','Entrenamiento 1'],
 'Antrenman 2':['Workout 2','Entrenamiento 2'],
 'Kişisel Antrenmanlarım':['My Workouts','Mis entrenamientos'],
 'Yeni Antrenman':['New Workout','Nuevo entrenamiento'],
 'Henüz kişisel antrenman yok.':['No custom workouts yet.','Todavía no hay entrenamientos personalizados.'],
 'Yarat':['Create','Crear'],
 'Programı Seç':['Select Program','Seleccionar programa'],
 'Programı Ekle ve Seç':['Add and Select Program','Añadir y seleccionar programa'],
 'Bölgesel A/B Programları':['Muscle-group A/B Programs','Programas A/B por grupo muscular'],
 'Bölgesel A/B':['Muscle-group A/B','A/B por grupo muscular'],
 'Göğüs 5×5':['Chest 5×5','Pecho 5×5'],
 'Sırt 5×5':['Back 5×5','Espalda 5×5'],
 'Bacak 5×5':['Legs 5×5','Piernas 5×5'],
 'Kol 5×5':['Arms 5×5','Brazos 5×5'],
 'Göğüs':['Chest','Pecho'],
 'Sırt':['Back','Espalda'],
 'Bacak':['Legs','Piernas'],
 'Kol':['Arms','Brazos'],
 'A/B dönüşümlü · Ana hareket 5×5 · Yardımcılar 3×8–12':['Alternate A/B · Main lifts 5×5 · Accessories 3×8–12','Alterna A/B · Ejercicios principales 5×5 · Accesorios 3×8–12'],
 'A ve B antrenmanları dönüşümlü yapılır. Tüm setler 5 tekrar tamamlanırsa ağırlık artar.':['Alternate workouts A and B. Increase the weight when all sets reach five reps.','Alterna los entrenamientos A y B. Aumenta el peso al completar cinco repeticiones en todas las series.'],
 'A ve B dönüşümlü yapılır. Kişisel antrenmanlar kendi başına çalışır; tüm setler tamamlanırsa ağırlık +kg kadar artar.':['Alternate A and B. Custom workouts progress separately; complete all sets to increase the load.','Alterna A y B. Los entrenamientos personalizados progresan por separado; completa todas las series para aumentar el peso.'],
 'Program İçe Aktar':['Import Program','Importar programa'],
 'Programı Paylaş':['Share Program','Compartir programa'],
 'Program Yarat':['Create Program','Crear programa'],
 'Program Adı':['Program Name','Nombre del programa'],
 'Program kaydedildi, aktif yapmak için kartına dokun':['Program saved. Tap its card to activate it.','Programa guardado. Toca su tarjeta para activarlo.'],
 'Program doğrulandı ve içe aktarıldı':['Program validated and imported','Programa validado e importado'],
 'Program yüklenmedi; mevcut kayıtların korundu':['Import failed; your records are safe','No se importó el programa; tus datos siguen seguros'],
 'Program kaydedilemedi':['Could not save program','No se pudo guardar el programa'],
 'Aktif program değişti':['Active program changed','Programa activo cambiado'],
 'StrongLifts 5×5 aktif':['StrongLifts 5×5 activated','StrongLifts 5×5 activado'],
 'Programı Kaydet':['Save Program','Guardar programa'],
 'Programı Seç':['Select Program','Seleccionar programa'],
 'Tüm Vücut':['Full Body','Cuerpo completo'],
 'Üst / Alt':['Upper / Lower','Superior / Inferior'],
 'Push / Pull / Leg':['Push / Pull / Legs','Empuje / Tirón / Piernas'],
 'Özel':['Custom','Personalizado'],
 'Antrenman Dağılımı':['Training Split','División de entrenamiento'],
 'Antrenman Ekle':['Add Workout','Añadir entrenamiento'],
 'Antrenmanı Sil':['Delete Workout','Eliminar entrenamiento'],
 'Egzersiz Ekle':['Add Exercise','Añadir ejercicio'],
 'Egzersiz adı':['Exercise name','Nombre del ejercicio'],
 'Egzersiz yok':['No exercises','Sin ejercicios'],
 'Egzersiz Ağırlığı':['Exercise Weight','Peso del ejercicio'],
 'Antrenman adı (ör. Kol Günü)':['Workout name (e.g. Arm Day)','Nombre del entrenamiento (p. ej., día de brazos)'],
 'Antrenman adı':['Workout name','Nombre del entrenamiento'],
 'Ekle':['Add','Añadir'],
 'Düzenle':['Edit','Editar'],
 'Sil':['Delete','Eliminar'],
 'Kaydet':['Save','Guardar'],
 'Bitti':['Done','Listo'],
 'Tamam':['Done','Listo'],
 'Kapat':['Close','Cerrar'],
 'Vazgeç':['Cancel','Cancelar'],
 'Emin misin?':['Are you sure?','¿Estás seguro?'],
 'Emin misin? Tekrar dokun':['Are you sure? Tap again','¿Seguro? Toca de nuevo'],
 'Önce açık antrenmanı tamamla veya kapat':['Finish or close the current workout first','Primero termina o cierra el entrenamiento actual'],
 'Önce mevcut antrenmanı tamamla':['Finish the current workout first','Primero termina el entrenamiento actual'],
 'Devam eden antrenman var':['A workout is already in progress','Ya hay un entrenamiento en curso'],
 'Antrenman kaydedildi 🎉':['Workout saved 🎉','Entrenamiento guardado 🎉'],
 'Yeni rekor! 🏆':['New personal best! 🏆','¡Nuevo récord personal! 🏆'],
 'Antrenman saklanamadı; açık seans korundu':['Could not save workout; active session preserved','No se pudo guardar; se conservó la sesión activa'],
 'Antrenman Günü Bildirimi':['Workout Day Reminder','Recordatorio de entrenamiento'],
 'Bildirimler':['Notifications','Notificaciones'],
 'Bildirim Saati ve Günler':['Notification Time and Days','Hora y días de notificación'],
 'Set Süresi Bitiş Bildirimi':['Rest Timer Notification','Aviso de fin de descanso'],
 'Bildirim Zamanı':['Notification Time','Hora de notificación'],
 'Bildirimler açık':['Notifications enabled','Notificaciones activadas'],
 'Bildirim testi başarılı':['Notification test successful','Prueba de notificación correcta'],
 'Bildirim izni alınamadı (tarayıcı desteklemiyor ya da izin verilmedi)':['Notification permission unavailable or denied','Permiso de notificaciones no disponible o denegado'],
 'Antrenman günü 🏋️':['Workout day 🏋️','Día de entrenamiento 🏋️'],
 'Dinlenme bitti':['Rest complete','Descanso terminado'],
 'Sıradaki sete hazırsın 💪':['Ready for your next set 💪','Listo para la siguiente serie 💪'],
 'Antrenman günü bildirimi seçtiğin günlerde, saat gelince ve o gün henüz antrenman yapmadıysan gönderilir.':['Reminders appear on selected days if you have not trained yet.','Los recordatorios aparecen los días elegidos si todavía no has entrenado.'],
 'Hesap':['Account','Cuenta'],
 'Profil':['Profile','Perfil'],
 'Tercihler':['Preferences','Preferencias'],
 'Dil':['Language','Idioma'],
 'Birimler':['Units','Unidades'],
 'Kilogram':['Kilograms','Kilogramos'],
 'Sesler':['Sounds','Sonidos'],
 'Ses Seviyesi':['Sound Volume','Volumen del sonido'],
 'Dinlenme Sayacı':['Rest Timer','Temporizador de descanso'],
 'Dinlenme Süreleri':['Rest Periods','Tiempos de descanso'],
 'Isınma':['Warm-up','Calentamiento'],
 'Ekranı Otomatik Kilitle':['Auto-lock Screen','Bloquear pantalla automáticamente'],
 'Ağırlıklar':['Weights','Pesos'],
 'Ağırlık':['Weight','Peso'],
 'Ağırlıklar (kg)':['Weights (kg)','Pesos (kg)'],
 'Artışlar':['Increments','Incrementos'],
 'Artış Miktarları':['Weight Increments','Incrementos de peso'],
 'Artış Miktarları (kg)':['Weight Increments (kg)','Incrementos de peso (kg)'],
 'Başarısız set sonrası (sn)':['After a failed set (sec)','Tras una serie fallida (s)'],
 '5 tekrar sonrası (sn)':['After five reps (sec)','Tras cinco repeticiones (s)'],
 'Görünüm':['Appearance','Apariencia'],
 'Tema':['Theme','Tema'],
 'Otomatik':['Automatic','Automático'],
 'Otomatik (Sistem)':['Automatic (System)','Automático (sistema)'],
 'Koyu':['Dark','Oscuro'],
 'Açık':['Light','Claro'],
 'Vurgu Rengi':['Accent Color','Color de acento'],
 'Nane':['Mint','Menta'],
 'Mavi':['Blue','Azul'],
 'Kırmızı':['Red','Rojo'],
 'Turuncu':['Orange','Naranja'],
 'Düşük':['Low','Bajo'],
 'Orta':['Medium','Medio'],
 'Yüksek':['High','Alto'],
 'Destek':['Help','Ayuda'],
 'StrongLifts 5×5 Rehberi':['StrongLifts 5×5 Guide','Guía de StrongLifts 5×5'],
 'Veriler ve Erişim':['Data and Access','Datos y acceso'],
 'Veriler':['Data','Datos'],
 'Verileri Dışa / İçe Aktar':['Export / Import Data','Exportar / Importar datos'],
 'Dışa Aktar':['Export','Exportar'],
 'İçe Aktar':['Import','Importar'],
 'Verileri Sıfırla':['Reset Data','Restablecer datos'],
 'Tüm antrenmanlar, ağırlıklar ve kişisel programlar silinir.':['This will delete all workouts, weights and custom programs.','Se eliminarán todos los entrenamientos, pesos y programas personalizados.'],
 'StrongLifts 5×5 · web sürümü':['StrongLifts 5×5 · web version','StrongLifts 5×5 · versión web'],
 'İsim':['Name','Nombre'],
 'Vücut ağırlığı (kg)':['Body Weight (kg)','Peso corporal (kg)'],
 'Saat':['Time','Hora'],
 'Pzt':['Mon','Lun'],
 'Sal':['Tue','Mar'],
 'Çar':['Wed','Mié'],
 'Per':['Thu','Jue'],
 'Cum':['Fri','Vie'],
 'Cmt':['Sat','Sáb'],
 'Paz':['Sun','Dom'],
 'Liste':['List','Lista'],
 'Takvim':['Calendar','Calendario'],
 'Notlar':['Notes','Notas'],
 'Not':['Note','Nota'],
 'Not yok.':['No notes yet.','Todavía no hay notas.'],
 'Henüz antrenman yok.':['No workouts yet.','Todavía no hay entrenamientos.'],
 'Not ekle':['Add note','Añadir nota'],
 'Yeni Antrenman':['New Workout','Nuevo entrenamiento'],
 'Set':['Sets','Series'],
 'Tekrar':['Repetitions','Repeticiones'],
 'Set×Tekrar':['Sets×Reps','Series×Reps'],
 'Dinlenme':['Rest','Descanso'],
 'Atla':['Skip','Saltar'],
 'Plakalar':['Plates','Discos'],
 'Bar Ağırlığı':['Bar Weight','Peso de la barra'],
 'Sıklık':['Frequency','Frecuencia'],
 'Deload':['Deload','Descarga'],
 'Form':['Form','Técnica'],
 'Videoyu Ara':['Find Video','Buscar vídeo'],
 'Bu egzersiz için form açıklaması yok.':['No form instructions for this exercise.','No hay indicaciones técnicas para este ejercicio.'],
 'Grafik için en az iki kayıt gerekir.':['At least two entries are needed for a chart.','Se necesitan al menos dos registros para el gráfico.'],
 'Henüz kayıt yok.':['No records yet.','Todavía no hay registros.'],
 'Yarın':['Tomorrow','Mañana'],
 'sadece bar':['bar only','solo barra'],
 'Plaka eklemek için dokun · çıkarmak için çizimdeki plakaya dokun':['Tap to add plates · tap a plate on the bar to remove it','Toca para añadir discos · toca un disco en la barra para quitarlo'],
 'Veri kurtarma':['Data Recovery','Recuperación de datos'],
 'Mevcut kayıt silinmedi. Önce ham veriyi kopyala, ardından varsa geçerli yedeğini yapıştır.':['Your saved data was not deleted. Copy the raw record first, then paste a valid backup if available.','No se borraron tus datos. Copia el registro original y después pega una copia de seguridad válida si la tienes.'],
 'Ham veriyi görüntüle':['View Raw Data','Ver datos originales'],
 'Ham yerel veri yedeği':['Raw Local Backup','Copia local original'],
 'Geçerli JSON yedeğini buraya yapıştır':['Paste a valid JSON backup here','Pega aquí una copia JSON válida'],
 'Doğrula ve yedeği geri yükle':['Validate and Restore Backup','Validar y restaurar copia'],
 'Yeniden dene':['Try Again','Reintentar'],
 'Kayıt saklanamadı. Depolamayı kontrol edip yedeğini al.':['Could not save. Check device storage and make a backup.','No se pudo guardar. Comprueba el almacenamiento y haz una copia.'],
 'Yedek verisi':['Backup data','Datos de respaldo'],
 'Yedek doğrulandı ve geri yüklendi':['Backup validated and restored','Copia validada y restaurada'],
 'Yedek yüklenmedi; mevcut kayıtların korundu':['Import failed; existing records preserved','No se importó; se conservaron los datos existentes'],
 'Kurtarma başarısız; önceki kayıt korundu':['Recovery failed; original record preserved','Falló la recuperación; se conservó el registro original'],
 'Yedek güvenle geri yüklendi':['Backup restored safely','Copia restaurada correctamente'],
 'Kopyala':['Copy','Copiar'],
 'Kopyalandı':['Copied','Copiado'],
 'Program verisi':['Program data','Datos del programa'],
 'Ayarlar (kg)':['Settings (kg)','Ajustes (kg)'],
 'Haftada 3 gün, A ve B antrenmanlarını dönüşümlü yap. A: Squat, Bench Press, Barbell Row. B: Squat, Overhead Press, Deadlift.':['Train three days a week, alternating A and B. A: Squat, Bench Press, Barbell Row. B: Squat, Overhead Press, Deadlift.','Entrena tres días por semana alternando A y B. A: Squat, Bench Press, Barbell Row. B: Squat, Overhead Press, Deadlift.'],
 'Tüm setleri tamamlarsan bir sonraki antrenmanda ağırlık artar (Deadlift +5 kg, diğerleri +2,5 kg). Aynı egzersizde 3 kez üst üste başarısız olursan ağırlık %10 düşer.':['If you finish every set, add weight next session (Deadlift +5 kg; other lifts +2.5 kg). After three failed sessions on one lift, reduce the load by 10%.','Si completas todas las series, aumenta el peso en la siguiente sesión (peso muerto +5 kg; demás ejercicios +2,5 kg). Tras tres fallos seguidos en un ejercicio, reduce la carga un 10%.'],
 'Dinlenme: 5 tekrar sonrası yaklaşık 90 sn, başarısız sette 3 dk.':['Rest: about 90 seconds after five reps, three minutes after a failed set.','Descanso: unos 90 segundos tras cinco repeticiones y tres minutos tras una serie fallida.']
};
// Merge repeated keys only once; the displayed text is the translation boundary.
const REGEX={
 en:[
  [/^(Günaydın|İyi günler|İyi akşamlar)(,.*)$/,(m,a,b)=>phrases[a][0]+b],
  [/(\d+) gün sonra/g,(_,n)=>n+' days from now'],
  [/(\d+) egzersiz/g,(_,n)=>n+' exercises'],
  [/(\d+) antrenman/g,(_,n)=>n+' workouts'],
  [/(\d+) dk\b/g,(_,n)=>n+' min'],
  [/\bEn iyi\b/g,'Best'],
  [/\bTahmini 1TM\b/g,'Estimated 1RM'],
  [/\/taraf\b/g,'/side'],
  [/\bAntrenman ([AB])\b/g,'Workout $1'],
  [/\bBugün antrenman günü: /g,"Today's workout: "],
  [/\bBugün ([AB]) antrenmanı var/g,"Today's workout is $1"],
  [/\bAntrenman günü: /g,'Workout day: '],
  [/\b sn\b/g,' sec']
 ],
 es:[
  [/^(Günaydın|İyi günler|İyi akşamlar)(,.*)$/,(m,a,b)=>phrases[a][1]+b],
  [/(\d+) gün sonra/g,(_,n)=>'en '+n+' días'],
  [/(\d+) egzersiz/g,(_,n)=>n+' ejercicios'],
  [/(\d+) antrenman/g,(_,n)=>n+' entrenamientos'],
  [/(\d+) dk\b/g,(_,n)=>n+' min'],
  [/\bEn iyi\b/g,'Mejor'],
  [/\bTahmini 1TM\b/g,'1RM estimada'],
  [/\/taraf\b/g,'/lado'],
  [/\bAntrenman ([AB])\b/g,'Entrenamiento $1'],
  [/\bBugün antrenman günü: /g,'Entrenamiento de hoy: '],
  [/\bBugün ([AB]) antrenmanı var/g,'Hoy toca el entrenamiento $1'],
  [/\bAntrenman günü: /g,'Día de entrenamiento: '],
  [/\b sn\b/g,' s']
 ]
};
export function translateText(text,lang='en'){
 const language=languageOf(lang);
 if(language==='tr'||typeof text!=='string'||!text.trim())return text;
 const source=text.trim(),dict=phrases[source];
 const index=language==='es'?1:0;
 let result=dict?dict[index]:source;
 if(!dict)for(const [pattern,replacement] of REGEX[language])result=result.replace(pattern,replacement);
 const pos=text.indexOf(source);
 return text.slice(0,pos)+result+text.slice(pos+source.length);
}
const origin=new WeakMap();
function translatedValue(node,key,value,write,lang){
 const prior=origin.get(node)||{};
 const old=prior[key];
 const source=old&&old.last===value?old.raw:value;
 const next=translateText(source,lang);
 if(next!==value)write(next);
 prior[key]={raw:source,last:next};
 origin.set(node,prior);
}
export function localizeTree(root,lang='en'){
 if(!root)return;
 if(root.nodeType===3){
  if(root.parentElement?.closest?.('[data-i18n-ignore],script,style,textarea'))return;
  translatedValue(root,'text',root.nodeValue,v=>{root.nodeValue=v},lang);
  return;
 }
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1){
  if(root.matches?.('[data-i18n-ignore],script,style,textarea'))return;
  for(const attr of ['placeholder','aria-label','title']){
   if(root.hasAttribute?.(attr))translatedValue(root,attr,root.getAttribute(attr),v=>root.setAttribute(attr,v),lang);
  }
 }
 for(const child of Array.from(root.childNodes||[]))localizeTree(child,lang);
}
export const dateLocale=lang=>({en:'en-US',es:'es-ES',tr:'tr-TR'})[languageOf(lang)];
export function weekdayInitials(lang='en'){
 const l=languageOf(lang);
 return l==='es'?['L','M','X','J','V','S','D']:l==='tr'?['P','S','Ç','P','C','C','P']:['M','T','W','T','F','S','S'];
}
export function monthNames(lang='en'){
 const l=languageOf(lang),loc=dateLocale(l);
 return Array.from({length:12},(_,i)=>new Intl.DateTimeFormat(loc,{month:'long'}).format(new Date(2024,i,1)));
}
// Technique descriptions are source copy, not persisted user-created exercise names.
const form={
 'Squat':[
 ['Place the bar across your upper back. Set your feet shoulder-width apart with toes slightly out.','Brace your core and inhale deeply.','Sit back and down until your hips pass below your knees.','Keep knees tracking over toes and heels on the floor.','Push through the floor to stand, exhaling at the top.'],
 ['Coloca la barra sobre la parte alta de la espalda. Separa los pies al ancho de hombros y gira ligeramente las puntas.','Inhala profundamente y contrae el abdomen.','Lleva las caderas atrás y abajo hasta pasar la altura de las rodillas.','Mantén las rodillas alineadas con los pies y los talones apoyados.','Empuja el suelo para levantarte y exhala arriba.']
 ],
 'Bench Press':[
 ['Lie on the bench with both feet firmly on the floor.','Grip the bar slightly wider than shoulder-width with thumbs wrapped around it.','Unrack the bar above your shoulders with straight arms.','Inhale and lower the bar under control until it touches your chest.','Keep hips on the bench and press the bar upward.'],
 ['Acuéstate en el banco con ambos pies firmes en el suelo.','Sujeta la barra algo más ancho que los hombros, con pulgares rodeándola.','Saca la barra y mantenla sobre los hombros con los brazos extendidos.','Inhala y baja la barra de forma controlada hasta tocar el pecho.','Mantén las caderas apoyadas y empuja la barra hacia arriba.']
 ],
 'Barbell Row':[
 ['Stand shoulder-width apart and grip the bar at shoulder width.','Bend your knees slightly, keep your back flat and torso nearly parallel to the floor.','Pull the bar toward your abdomen with elbows moving back.','Squeeze your shoulder blades together at the top.','Lower the bar under control.'],
 ['Separa los pies y agarra la barra al ancho de hombros.','Flexiona ligeramente las rodillas, mantén la espalda recta y el torso casi paralelo al suelo.','Lleva la barra hacia el abdomen con los codos hacia atrás.','Junta las escápulas en la parte superior.','Baja la barra de forma controlada.']
 ],
 'Overhead Press':[
 ['Start with the bar at collarbone height and feet shoulder-width apart.','Tighten your glutes and core.','Press the bar vertically, moving your head slightly back to clear it.','Lock out the arms with the bar over midfoot.','Lower the bar under control to shoulder height.'],
 ['Comienza con la barra a la altura de las clavículas y los pies al ancho de hombros.','Contrae glúteos y abdomen.','Empuja la barra verticalmente y retira un poco la cabeza para dejarla pasar.','Extiende los brazos con la barra alineada sobre el centro del pie.','Baja la barra de forma controlada hasta los hombros.']
 ],
 'Deadlift':[
 ['Stand with the bar over midfoot and feet shoulder-width apart.','Bend down to grip the bar, keeping your back flat and chest up.','Inhale and push the floor away with your legs to lift the bar.','Keep the bar close to your legs and finish standing tall.','Lower the bar to the floor under control.'],
 ['Colócate con la barra sobre el centro del pie y los pies al ancho de hombros.','Inclínate para agarrar la barra con espalda recta y pecho arriba.','Inhala y empuja el suelo con las piernas para levantar la barra.','Mantén la barra cerca de las piernas hasta quedar completamente erguido.','Baja la barra al suelo de forma controlada.']
 ]
};
export function exerciseInstructions(name,lang,original){
 const l=languageOf(lang);
 return l==='tr'?original:(form[name]?.[l==='es'?1:0]||original);
}
