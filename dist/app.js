import {invitationIdFromPath,createGuestPatch,adaptXanoInvitation} from './backend-adapter.js?v=3';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const validMapUrl=value=>{try{const url=new URL(String(value||''));return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return''}};
const dictionary={
  ru:{open:'Открыть приглашение',invitation:'Приглашение на свадьбу',dear:'Для самых близких',dearScript:'Дорогие гости',signature:'С любовью и нежностью',whenSmall:'Сохраните дату',whereSmall:'Место встречи',location:'Локация',map:'Открыть карту',ourStory:'Наша история',momentOne:'вместе — наше любимое место',momentTwo:'и впереди целая жизнь',programSmall:'В этот день',timing:'Тайминг',answerSmall:'Ваш ответ',rsvp:'Будете с нами?',rsvpLead:'Пожалуйста, подтвердите присутствие — нам важно подготовить всё с заботой.',yourName:'Ваше имя',attendance:'Вы сможете прийти?',yes:'С радостью приду',no:'К сожалению, не смогу',count:'Количество гостей',wish:'Пожелание молодожёнам',send:'Отправить ответ',sending:'Отправляем…',sent:'Спасибо! Ваш ответ сохранён.',sendError:'Не удалось сохранить ответ. Попробуйте ещё раз.',guestList:'Список гостей',ourGuestsSmall:'С любовью',guests:'гостей',oneGuest:'гость',attending:'придёт',notAttending:'не придёт',emptyGuests:'Пока здесь нет ответов гостей.',weekdays:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']},
  ky:{open:'Чакырууну ачуу',invitation:'Үйлөнүү тоюна чакыруу',dear:'Эң жакындарыбызга',dearScript:'Кымбаттуу коноктор',signature:'Сүйүү жана назиктик менен',whenSmall:'Күндү белгилеп коюңуз',whereSmall:'Жолугушуу жери',location:'Дарек',map:'Картадан ачуу',ourStory:'Биздин баяныбыз',momentOne:'бирге — эң сүйүктүү жерибиз',momentTwo:'алдыда бүтүндөй өмүр бар',programSmall:'Бул күнү',timing:'Күндүн программасы',answerSmall:'Сиздин жообуңуз',rsvp:'Биз менен болосузбу?',rsvpLead:'Катышарыңызды ырастап коюңуз — баарын камкордук менен даярдоо биз үчүн маанилүү.',yourName:'Сиздин атыңыз',attendance:'Тойго келе аласызбы?',yes:'Кубануу менен келем',no:'Тилекке каршы, келе албайм',count:'Коноктордун саны',wish:'Жаштарга каалоо',send:'Жоопту жөнөтүү',sending:'Жөнөтүлүүдө…',sent:'Рахмат! Жообуңуз сакталды.',sendError:'Жооп сакталган жок. Кайра аракет кылыңыз.',weekdays:['Дш','Шш','Шр','Бш','Жм','Иш','Жк'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']},
  kk:{invitation:'Үйлену тойына шақыру',dear:'Ең жақындарымызға',signature:'Сүйіспеншілікпен',whenSmall:'Күнді сақтаңыз',whereSmall:'Кездесу орны',location:'Мекенжай',programSmall:'Осы күні',timing:'Күн бағдарламасы',answerSmall:'Сіздің жауабыңыз',rsvp:'Бізбен бірге боласыз ба?',rsvpLead:'Қатысатыныңызды растаңыз — мерекені қамқорлықпен дайындағымыз келеді.',yourName:'Сіздің атыңыз',attendance:'Тойға келе аласыз ба?',yes:'Қуана келемін',no:'Өкінішке қарай, келе алмаймын',count:'Қонақтар саны',wish:'Жас жұбайларға тілек',send:'Жауапты жіберу',sending:'Жіберілуде…',sent:'Рақмет! Жауабыңыз сақталды.',sendError:'Жауап сақталмады. Қайталап көріңіз.',weekdays:['Дс','Сс','Ср','Бс','Жм','Сб','Жс'],months:['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан']}
};
Object.assign(dictionary.ru,{untilSmall:'Самое важное впереди',untilWedding:'До свадьбы осталось',days:'дней',hours:'часов',minutes:'минут',seconds:'секунд'});
Object.assign(dictionary.ky,{untilSmall:'Эң маанилүү күн алдыда',untilWedding:'Тойго чейин калды',days:'күн',hours:'саат',minutes:'мүнөт',seconds:'секунд'});
Object.assign(dictionary.kk,{untilSmall:'Ең маңызды күн алда',untilWedding:'Тойға дейін қалды',days:'күн',hours:'сағат',minutes:'минут',seconds:'секунд'});

let locale=localStorage.getItem('emerald-lace-language')||'ru';
let config=null, rawRecord=null, inviteId=null, fallback=null;

async function loadData(){
  fallback=await fetch('./content.json',{cache:'no-cache'}).then(r=>r.json());
  inviteId=invitationIdFromPath(location.pathname,fallback.backend.defaultId);
  if(!inviteId){inviteId=String(fallback.backend.defaultId)}
  try{
    const response=await fetch(`${fallback.backend.baseUrl}/${inviteId}`,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    rawRecord=await response.json();
    config=adaptXanoInvitation(rawRecord,fallback);
  }catch(error){console.warn('Using invitation fallback',error);config=fallback;rawRecord=null}
  const enabled=config.enabledLanguages||['ru','ky'];if(!enabled.includes(locale))locale=config.defaultLanguage||enabled[0];
  const switcher=$('.language-menu');$$('[data-lang]',switcher).forEach(button=>button.hidden=!enabled.includes(button.dataset.lang));switcher.hidden=enabled.length<2;
  render();
}

function render(){
  document.documentElement.lang=locale;
  document.body.classList.toggle('lang-ky',locale!=='ru');
  $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===locale));
  $('.language-menu__current').textContent=locale==='ky'?'KG':locale==='kk'?'KZ':'RU';
  $$('[data-i18n]').forEach(el=>{const value=dictionary[locale][el.dataset.i18n];if(value)el.textContent=value});
  $$('[data-name="first"]').forEach(el=>el.textContent=config.names.first);
  $$('[data-name="second"]').forEach(el=>el.textContent=config.names.second);
  $('[data-initial="first"]').textContent=[...config.names.first][0]||'';
  $('[data-initial="second"]').textContent=[...config.names.second][0]||'';
  const data=config.locales[locale];
  $('[data-content="welcomeTitle"]').textContent=data.welcomeTitle||dictionary[locale].dearScript||'';
  $('[data-content="welcome"]').textContent=data.welcome;
  $$('[data-venue]').forEach(el=>el.textContent=data.venue[el.dataset.venue]||'');
  const date=new Date(config.date);
  const localeCode=locale==='ky'?'ky-KG':locale==='kk'?'kk-KZ':'ru-RU';
  const long=date.toLocaleDateString(localeCode,{day:'numeric',month:'long',year:'numeric',timeZone:config.timezone});
  $('[data-date="long"]').textContent=long;
  $('[data-date="monthYear"]').textContent=`${dictionary[locale].months[date.getMonth()]} ${date.getFullYear()}`;
  $('[data-date="weekday"]').textContent=date.toLocaleDateString(localeCode,{weekday:'long',timeZone:config.timezone});
  $('[data-date="time"]').textContent=date.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:config.timezone});
  $('[data-date="short"]').textContent=new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:config.timezone}).format(date).replaceAll('.',' · ').replace(/ · $/,'');
  const query=[data.venue.name,data.venue.address].filter(Boolean).join(', '),google=validMapUrl(config.map?.googleUrl)||(query?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`:''),twoGis=validMapUrl(config.map?.twoGisUrl)||(query?`https://2gis.kg/search/${encodeURIComponent(query)}`:'');const mapBox=$('.map-buttons');mapBox.hidden=!(google||twoGis);$('#googleMapLink').hidden=!google;$('#twoGisLink').hidden=!twoGis;$('#googleMapLink').href=google||'#';$('#twoGisLink').href=twoGis||'#';
  const wish=$('#wishBlock');wish.hidden=!config.wishBlock?.enabled;if(!wish.hidden){$('#wishBlockTitle').textContent=data.wishTitle;$('#wishBlockText').textContent=data.wishText}
  $('#rsvp').hidden=config.rsvp?.enabled===false;$('#guestWishField').hidden=config.rsvp?.allowGuestWish===false;configureGuestCount();
  renderCalendar(date);renderSchedule(data.schedule);updateCountdown();updateMetadata(long);
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

function configureGuestCount(){const select=$('[name="guests_count"]'),max=config.rsvp?.maxGuests||10;select.replaceChildren(...Array.from({length:max},(_,index)=>Object.assign(document.createElement('option'),{value:String(index+1),textContent:String(index+1)})))}
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

const languageMenu=$('.language-menu'),languageMenuToggle=$('.language-menu__toggle');
languageMenuToggle.addEventListener('click',()=>{const open=languageMenu.classList.toggle('is-open');languageMenuToggle.setAttribute('aria-expanded',String(open))});
document.addEventListener('click',event=>{if(!languageMenu.contains(event.target)){languageMenu.classList.remove('is-open');languageMenuToggle.setAttribute('aria-expanded','false')}});
$$('[data-lang]').forEach(button=>button.addEventListener('click',()=>{locale=button.dataset.lang;localStorage.setItem('emerald-lace-language',locale);if(config)render();languageMenu.classList.remove('is-open');languageMenuToggle.setAttribute('aria-expanded','false')}));

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
    rawRecord=payload;config=adaptXanoInvitation(payload,fallback);form.reset();status.textContent=dictionary[locale].sent;
  }catch(error){console.error(error);status.textContent=dictionary[locale].sendError}
  finally{button.disabled=false;$('span',button).textContent=dictionary[locale].send}
});

let observer;
function observeReveals(){
  observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.14});
  $$('.reveal:not(.is-visible)').forEach(el=>observer.observe(el));
}
observeReveals();loadData();setInterval(updateCountdown,1000);
