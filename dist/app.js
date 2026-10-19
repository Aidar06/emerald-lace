import {invitationIdFromPath,createGuestPatch,adaptXanoInvitation} from './backend-adapter.js';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const dictionary={
  ru:{open:'Открыть приглашение',invitation:'Приглашение на свадьбу',dear:'Для самых близких',dearScript:'Дорогие гости',signature:'С любовью и нежностью',whenSmall:'Сохраните дату',whereSmall:'Место встречи',location:'Локация',map:'Открыть карту',ourStory:'Наша история',momentOne:'вместе — наше любимое место',momentTwo:'и впереди целая жизнь',programSmall:'В этот день',timing:'Тайминг',answerSmall:'Ваш ответ',rsvp:'Будете с нами?',rsvpLead:'Пожалуйста, подтвердите присутствие — нам важно подготовить всё с заботой.',yourName:'Ваше имя',attendance:'Вы сможете прийти?',yes:'С радостью приду',no:'К сожалению, не смогу',count:'Количество гостей',wish:'Пожелание молодожёнам',send:'Отправить ответ',sending:'Отправляем…',sent:'Спасибо! Ваш ответ сохранён.',sendError:'Не удалось сохранить ответ. Попробуйте ещё раз.',guestList:'Список гостей',ourGuestsSmall:'С любовью',guests:'гостей',oneGuest:'гость',attending:'придёт',notAttending:'не придёт',emptyGuests:'Пока здесь нет ответов гостей.',weekdays:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']},
  ky:{open:'Чакырууну ачуу',invitation:'Үйлөнүү тоюна чакыруу',dear:'Эң жакындарыбызга',dearScript:'Кымбаттуу коноктор',signature:'Сүйүү жана назиктик менен',whenSmall:'Күндү белгилеп коюңуз',whereSmall:'Жолугушуу жери',location:'Дарек',map:'Картадан ачуу',ourStory:'Биздин баяныбыз',momentOne:'бирге — эң сүйүктүү жерибиз',momentTwo:'алдыда бүтүндөй өмүр бар',programSmall:'Бул күнү',timing:'Күндүн программасы',answerSmall:'Сиздин жообуңуз',rsvp:'Биз менен болосузбу?',rsvpLead:'Катышарыңызды ырастап коюңуз — баарын камкордук менен даярдоо биз үчүн маанилүү.',yourName:'Сиздин атыңыз',attendance:'Тойго келе аласызбы?',yes:'Кубануу менен келем',no:'Тилекке каршы, келе албайм',count:'Коноктордун саны',wish:'Жаштарга каалоо',send:'Жоопту жөнөтүү',sending:'Жөнөтүлүүдө…',sent:'Рахмат! Жообуңуз сакталды.',sendError:'Жооп сакталган жок. Кайра аракет кылыңыз.',guestList:'Коноктор тизмеси',ourGuestsSmall:'Сүйүү менен',guests:'конок',oneGuest:'конок',attending:'келет',notAttending:'келбейт',emptyGuests:'Азырынча коноктордон жооп жок.',weekdays:['Дш','Шш','Шр','Бш','Жм','Иш','Жк'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']}
};
Object.assign(dictionary.ru,{untilSmall:'Самое важное впереди',untilWedding:'До свадьбы осталось',days:'дней',hours:'часов',minutes:'минут',seconds:'секунд'});
Object.assign(dictionary.ky,{untilSmall:'Эң маанилүү күн алдыда',untilWedding:'Тойго чейин калды',days:'күн',hours:'саат',minutes:'мүнөт',seconds:'секунд'});

let locale=localStorage.getItem('emerald-lace-language')||'ru';
let config=null, rawRecord=null, inviteId=null;

async function loadData(){
  const fallback=await fetch('./content.json',{cache:'no-cache'}).then(r=>r.json());
  inviteId=invitationIdFromPath(location.pathname,fallback.backend.defaultId);
  if(!inviteId){inviteId=String(fallback.backend.defaultId)}
  try{
    const response=await fetch(`${fallback.backend.baseUrl}/${inviteId}`,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    rawRecord=await response.json();
    config=adaptXanoInvitation(rawRecord,fallback);
  }catch(error){console.warn('Using invitation fallback',error);config=fallback;rawRecord=null}
  render();
}

function render(){
  document.documentElement.lang=locale==='ky'?'ky':'ru';
  document.body.classList.toggle('lang-ky',locale==='ky');
  $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===locale));
  $$('[data-i18n]').forEach(el=>{const value=dictionary[locale][el.dataset.i18n];if(value)el.textContent=value});
  $$('[data-name="first"]').forEach(el=>el.textContent=config.names.first);
  $$('[data-name="second"]').forEach(el=>el.textContent=config.names.second);
  $('[data-initial="first"]').textContent=[...config.names.first][0]||'';
  $('[data-initial="second"]').textContent=[...config.names.second][0]||'';
  const data=config.locales[locale];
  $('[data-content="welcome"]').textContent=data.welcome;
  $$('[data-venue]').forEach(el=>el.textContent=data.venue[el.dataset.venue]||'');
  const date=new Date(config.date);
  const long=date.toLocaleDateString(locale==='ky'?'ky-KG':'ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:config.timezone});
  $('[data-date="long"]').textContent=long;
  $('[data-date="monthYear"]').textContent=`${dictionary[locale].months[date.getMonth()]} ${date.getFullYear()}`;
  $('[data-date="weekday"]').textContent=date.toLocaleDateString(locale==='ky'?'ky-KG':'ru-RU',{weekday:'long',timeZone:config.timezone});
  $('[data-date="time"]').textContent=date.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:config.timezone});
  $('[data-date="short"]').textContent=new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:config.timezone}).format(date).replaceAll('.',' · ').replace(/ · $/,'');
  const mapQuery=[data.venue.name,data.venue.address].filter(Boolean).join(', ');$('#googleMapLink').href=config.mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;$('#twoGisLink').href=`https://2gis.com/search/${encodeURIComponent(mapQuery)}`;
  renderCalendar(date);renderSchedule(data.schedule);renderGuests(config.guests||[]);updateCountdown();updateMetadata(long);
}

function renderCalendar(date){
  const holder=$('#calendar'),year=date.getFullYear(),month=date.getMonth(),target=date.getDate();
  const first=(new Date(year,month,1).getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  holder.innerHTML='';
  dictionary[locale].weekdays.forEach(day=>holder.insertAdjacentHTML('beforeend',`<span class="weekday">${day}</span>`));
  for(let i=0;i<first;i++)holder.insertAdjacentHTML('beforeend','<span class="empty">0</span>');
  for(let day=1;day<=days;day++)holder.insertAdjacentHTML('beforeend',`<span${day===target?' class="wedding-day" aria-label="Дата свадьбы"':''}>${day}</span>`);
}

function renderSchedule(items){
  $('#schedule').innerHTML=items.map((item,index)=>`<article class="timeline-item reveal"><time>${escapeHtml(item.time)}</time><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('');
  observeReveals();
}

function renderGuests(guests){
  const holder=$('#guestList');
  if(!guests.length){holder.innerHTML=`<p class="guest-empty">${dictionary[locale].emptyGuests}</p>`;return}
  holder.innerHTML=guests.map(g=>`<article class="guest-card"><h3>${escapeHtml(g.name)}</h3><span class="guest-meta ${g.is_attending?'yes':'no'}">${g.is_attending?dictionary[locale].attending:dictionary[locale].notAttending} · ${Number(g.guests_count)||1} ${Number(g.guests_count)===1?dictionary[locale].oneGuest:dictionary[locale].guests}</span>${g.wish?`<p>“${escapeHtml(g.wish)}”</p>`:''}</article>`).join('');
}

function updateCountdown(){
  if(!config)return;
  const remaining=Math.max(0,new Date(config.date).getTime()-Date.now());
  const values={days:Math.floor(remaining/86400000),hours:Math.floor(remaining/3600000)%24,minutes:Math.floor(remaining/60000)%60,seconds:Math.floor(remaining/1000)%60};
  $$('[data-count]').forEach(el=>{const key=el.dataset.count;el.textContent=key==='days'?String(values[key]).padStart(3,'0'):String(values[key]).padStart(2,'0')});
}

function updateMetadata(date){
  const title=`${config.names.first} & ${config.names.second} — ${dictionary[locale].invitation}`;
  const description=`${date}. ${config.locales[locale].venue.name}`;
  document.title=title;
  $('meta[name="description"]').content=description;
  $('meta[property="og:title"]').content=title;
  $('meta[property="og:description"]').content=description;
}

function escapeHtml(value=''){const div=document.createElement('div');div.textContent=String(value);return div.innerHTML}

$$('[data-lang]').forEach(button=>button.addEventListener('click',()=>{locale=button.dataset.lang;localStorage.setItem('emerald-lace-language',locale);if(config)render()}));

const intro=$('#intro'),video=$('#introVideo');
function finishIntro(){intro.classList.add('is-ending');setTimeout(()=>{intro.classList.add('is-done');document.body.classList.remove('intro-locked');sessionStorage.setItem('emerald-lace-opened','1')},650)}
$('#openInvitation').addEventListener('click',async()=>{
  if(intro.classList.contains('is-playing'))return;
  intro.classList.add('is-playing');
  try{video.currentTime=0;await video.play()}catch{setTimeout(finishIntro,4700)}
});
video.addEventListener('ended',finishIntro);
video.addEventListener('error',()=>setTimeout(finishIntro,4700));
if(sessionStorage.getItem('emerald-lace-opened')==='1'||new URLSearchParams(location.search).has('skipIntro')){intro.classList.add('is-done');document.body.classList.remove('intro-locked')}

const sheet=$('#guestSheet');
function toggleSheet(open){sheet.classList.toggle('is-open',open);sheet.setAttribute('aria-hidden',String(!open));document.body.style.overflow=open?'hidden':'';if(open)$('.sheet__close').focus()}
$('#openGuests').addEventListener('click',()=>toggleSheet(true));
$$('[data-close-sheet]').forEach(el=>el.addEventListener('click',()=>toggleSheet(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleSheet(false)});

$('#rsvpForm').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=$('button[type="submit"]',form),status=$('#formStatus');
  const values=new FormData(form),guest={name:values.get('name'),wish:values.get('wish'),guests_count:Number(values.get('guests_count')),is_attending:values.get('attending')==='yes'};
  button.disabled=true;$('span',button).textContent=dictionary[locale].sending;status.textContent='';
  try{
    const base=config.backend?.baseUrl||'https://x8ki-letl-twmt.n7.xano.io/api:X8-e2j1w/priglosi';
    const fresh=await fetch(`${base}/${inviteId}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('read');return r.json()});
    const payload=createGuestPatch(fresh,inviteId,guest);
    const response=await fetch(`${base}/${inviteId}/full`,{method:'PATCH',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    rawRecord=payload;config=adaptXanoInvitation(payload,config);renderGuests(config.guests);form.reset();status.textContent=dictionary[locale].sent;
  }catch(error){console.error(error);status.textContent=dictionary[locale].sendError}
  finally{button.disabled=false;$('span',button).textContent=dictionary[locale].send}
});

let observer;
function observeReveals(){
  observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.14});
  $$('.reveal:not(.is-visible)').forEach(el=>observer.observe(el));
}
observeReveals();loadData();setInterval(updateCountdown,1000);
