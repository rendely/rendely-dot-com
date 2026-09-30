const circle = (x,y,r,fill='#000') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const eyes = (x1,x2,y,r=12) => circle(x1,y,r)+circle(x2,y,r);
const cards = [
  {name:'Panda pal',art:circle(112,106,49)+circle(288,106,49)+`<ellipse cx="200" cy="204" rx="126" ry="116" fill="#fff" stroke="#000" stroke-width="12"/><ellipse cx="147" cy="187" rx="32" ry="43" transform="rotate(25 147 187)"/><ellipse cx="253" cy="187" rx="32" ry="43" transform="rotate(-25 253 187)"/>`+eyes(147,253,181,10).replaceAll('#000','#fff')+`<ellipse cx="200" cy="223" rx="19" ry="13"/>`+'<path d="M200 232v16m-26-4q26 25 52 0" stroke="#000" stroke-width="9" fill="none" stroke-linecap="round"/>'},
  {name:'Hello, bunny',art:`<ellipse cx="149" cy="116" rx="37" ry="78"/><ellipse cx="251" cy="116" rx="37" ry="78"/><ellipse cx="149" cy="109" rx="13" ry="48" fill="#fff"/><ellipse cx="251" cy="109" rx="13" ry="48" fill="#fff"/><ellipse cx="200" cy="244" rx="115" ry="96"/>`+eyes(156,244,225,13).replaceAll('#000','#fff')+'<path d="M185 257h30l-15 18z" fill="#fff"/><path d="M200 273v15m-25-3q25 22 50 0" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>'},
  {name:'Curious cat',art:'<path d="M88 183 L88 68 L167 123 Q200 110 233 123 L312 68 L312 183 Q342 313 200 329 Q58 313 88 183Z"/><path d="M105 100l43 34-42 18zm190 0-43 34 42 18z" fill="#fff"/>'+eyes(151,249,206,18).replaceAll('#000','#fff')+'<path d="M185 246h30l-15 18z" fill="#fff"/><path d="M200 264v20m-25-3q25 20 50 0M118 253H56m66 25-60 17m220-42h62m-66 25 60 17" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>'},
  {name:'Wide-eyed owl',art:'<path d="M91 90l69 32q40-13 80 0l69-32-5 94q46 147-104 159Q50 331 96 184z"/>'+circle(148,198,49,'#fff')+circle(252,198,49,'#fff')+eyes(148,252,198,23)+'<path d="M180 251h40l-20 30z" fill="#fff"/><path d="M124 276q12 30 35 37m117-37q-12 30-35 37" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>'},
  {name:'Little whale',art:'<path d="M59 208q0-98 127-98 98 0 115 117 40-4 30-57 68 10 30 74-15 28-49 28-49 77-168 29-85-20-85-93z"/>'+circle(125,197,13,'#fff')+'<path d="M99 239q34 31 72 8" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M199 86V55m0 16q-30-38-49-13m49 13q30-38 49-13" stroke="#000" stroke-width="13" fill="none" stroke-linecap="round"/>'},
  {name:'Flutterby',art:'<path d="M190 189C86 29 22 102 71 204 15 299 113 372 190 243zM210 189C314 29 378 102 329 204 385 299 287 372 210 243z"/>'+circle(112,157,30,'#fff')+circle(288,157,30,'#fff')+circle(117,268,25,'#fff')+circle(283,268,25,'#fff')+'<path d="M200 168v112m-6-115-26-39m38 39 26-39" stroke="#000" stroke-width="16" stroke-linecap="round"/>'+circle(200,168,19)},
  {name:'Happy sunshine',art:'<g stroke="#000" stroke-width="18" stroke-linecap="round">'+Array.from({length:12},(_,i)=>`<path d="M200 48v28" transform="rotate(${i*30} 200 200)"/>`).join('')+'</g>'+circle(200,200,98)+eyes(168,232,185,12).replaceAll('#000','#fff')+'<path d="M167 226q33 34 66 0" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"/>'},
  {name:'Starry night',dark:true,art:'<path d="M238 71C140 62 72 162 126 251c42 70 132 79 185 23-98 13-170-102-73-203z" fill="#fff"/>'+[[306,91,23],[319,184,18],[81,81,17],[75,312,22],[256,335,17]].map(([x,y,r])=>`<path d="M${x} ${y-r}l${r*.3} ${r*.7} ${r*.7} ${r*.3}-${r*.7} ${r*.3}-${r*.3} ${r*.7}-${r*.3}-${r*.7}-${r*.7}-${r*.3} ${r*.7}-${r*.3}z" fill="#fff"/>`).join('')},
  {name:'Tiny turtle',art:'<ellipse cx="126" cy="119" rx="26" ry="41" transform="rotate(-35 126 119)"/><ellipse cx="274" cy="119" rx="26" ry="41" transform="rotate(35 274 119)"/><ellipse cx="125" cy="285" rx="26" ry="41" transform="rotate(35 125 285)"/><ellipse cx="275" cy="285" rx="26" ry="41" transform="rotate(-35 275 285)"/>'+circle(200,80,38)+'<ellipse cx="200" cy="208" rx="98" ry="114"/><path d="M200 151l48 28v57l-48 28-48-28v-57zM200 151v-51m48 79 41-24m-41 81 40 24m-88 4v49m-48-77-40 24m40-81-41-24" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>'+eyes(186,214,73,7).replaceAll('#000','#fff')},
  {name:'Flower friend',art:Array.from({length:8},(_,i)=>`<ellipse cx="200" cy="117" rx="34" ry="53" transform="rotate(${i*45} 200 200)"/>`).join('')+circle(200,200,64,'#fff')+eyes(181,219,190,9)+ '<path d="M181 215q19 20 38 0" stroke="#000" stroke-width="7" stroke-linecap="round" fill="none"/>'}
  ,{name:'Hello, little face',art:'<ellipse cx="200" cy="200" rx="117" ry="137" fill="#fff" stroke="#000" stroke-width="14"/><path d="M93 150q18-105 107-92 94-12 107 92-65-8-107-48-43 40-107 48z"/>'+eyes(155,245,190,17)+'<path d="M200 206v29h-12m-31 28q43 40 86 0" fill="none" stroke="#000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'},
  {name:'Round-cheek friend',art:circle(200,200,133)+eyes(155,245,181,19).replaceAll('#000','#fff')+circle(118,237,22,'#fff')+circle(282,237,22,'#fff')+'<path d="M200 210v26m-37 28q37 32 74 0" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>'},
  {name:'Oh, hello!',art:'<ellipse cx="200" cy="200" rx="115" ry="139" fill="#fff" stroke="#000" stroke-width="14"/><path d="M109 122q9-40 46-39m5-6q27-21 55-5m12 6q38 0 58 40" fill="none" stroke="#000" stroke-width="20" stroke-linecap="round"/>'+eyes(154,246,183,19)+'<ellipse cx="200" cy="266" rx="23" ry="31"/><path d="M200 211v21" stroke="#000" stroke-width="12" stroke-linecap="round"/>'},
  {name:'Bold bands',art:[80,160,240].map(x=>`<rect x="${x}" y="60" width="40" height="280" rx="12"/>`).join('')},
  {name:'Across the way',art:[80,160,240].map(y=>`<rect x="60" y="${y}" width="280" height="40" rx="12"/>`).join('')},
  {name:'Big little dots',art:[[115,115,42],[285,115,42],[200,200,29],[115,285,42],[285,285,42]].map(([x,y,r])=>circle(x,y,r)).join('')},
  {name:'Round and round',art:circle(200,200,145)+circle(200,200,108,'#fff')+circle(200,200,72)+circle(200,200,35,'#fff')},
  {name:'Checker picnic',art:Array.from({length:4},(_,row)=>Array.from({length:4},(_,col)=>(row+col)%2===0?`<rect x="${60+col*70}" y="${60+row*70}" width="70" height="70"/>`:'').join('')).join('')},
  {name:'Gentle waves',art:'<g fill="none" stroke="#000" stroke-width="26" stroke-linecap="round"><path d="M65 113q45-48 90 0t90 0t90 0M65 200q45-48 90 0t90 0t90 0M65 287q45-48 90 0t90 0t90 0"/></g>'},
  {name:'One big shape',dark:true,art:'<path d="M200 62 338 310H62z" fill="#fff"/>'}

];
const card = document.querySelector('#card');
const dots = document.querySelector('#dots');
let current = 0;
cards.forEach((item,index)=>{
  const button=document.createElement('button');
  button.type='button';button.setAttribute('aria-label',`Card ${index+1}: ${item.name}`);
  button.addEventListener('click',()=>show(index));dots.append(button);
});
function show(index,announce=true){
  current=(index+cards.length)%cards.length;
  const item=cards[current];
  card.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" aria-hidden="true"><rect width="400" height="400" fill="${item.dark?'#000':'#fff'}"/><g fill="#000">${item.art}</g></svg>`;
  card.setAttribute('aria-label',`${item.name}. Tap for the next card.`);
  document.querySelector('#card-name').textContent=item.name;
  document.querySelector('#count').textContent=`${String(current+1).padStart(2,'0')} / ${cards.length}`;
  [...dots.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  if(announce)document.querySelector('#announcement').textContent=`${item.name}, card ${current+1} of ${cards.length}`;
}
card.addEventListener('click',()=>show(current+1));
document.querySelector('#next').addEventListener('click',()=>show(current+1));
document.querySelector('#previous').addEventListener('click',()=>show(current-1));
const quietButton=document.querySelector('#quiet'),exitButton=document.querySelector('#exit-quiet');
function quiet(enabled){
  document.body.classList.toggle('quiet',enabled);exitButton.hidden=!enabled;
  quietButton.setAttribute('aria-pressed',String(enabled));
  (enabled?exitButton:quietButton).focus();
}
quietButton.addEventListener('click',()=>quiet(true));exitButton.addEventListener('click',()=>quiet(false));
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}
  if(event.key==='Escape'&&document.body.classList.contains('quiet'))quiet(false);
});
show(0,false);
