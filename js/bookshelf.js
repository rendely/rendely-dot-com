import { books } from './books.js';

const stage = document.querySelector('#shelf-stage');
const shelves = document.querySelector('#shelves');
const dialog = document.querySelector('#book-dialog');
const spread = document.querySelector('#open-book');
const front = document.querySelector('.flying-cover');
const left = document.querySelector('.left-page');
const closeButton = document.querySelector('#close-book');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const buttons = [], covers = [];
let selected = -1, phase = 'idle', animations = [], sceneAPI;

function makeCover(book, index) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 768;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = book.color; ctx.fillRect(0, 0, 768, 768);
  const binding = ctx.createLinearGradient(0,0,68,0);
  binding.addColorStop(0,'#00000030'); binding.addColorStop(.45,'#00000005'); binding.addColorStop(.6,'#ffffff18'); binding.addColorStop(1,'#ffffff00');
  ctx.fillStyle=binding;ctx.fillRect(0,0,68,768);
  ctx.fillStyle=book.ink;ctx.font='24px Arial';ctx.fillText(book.category.toUpperCase(),65,69);
  ctx.textAlign='right';ctx.fillText(`0${index+1}`,714,69);ctx.textAlign='left';
  // Simple geometric print motifs make each volume recognizable without relying on color alone.
  ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle=book.ink;ctx.lineWidth=3;
  ctx.translate(388,250);
  if(index===0){for(let i=0;i<5;i++){ctx.save();ctx.rotate(Math.PI/4);ctx.strokeRect(-92-i*18,-92-i*18,184+i*36,184+i*36);ctx.restore();}}
  if(index===1){for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-84+i*34,0,92,0,Math.PI*2);ctx.stroke();}}
  if(index===2){for(let i=0;i<6;i++){ctx.strokeRect(-132+i*21,-105+i*15,200,165);}}
  if(index===3){for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-146,-98+i*43);ctx.lineTo(-55,-44+i*26);ctx.lineTo(26,-96+i*22);ctx.lineTo(143,-126+i*35);ctx.stroke();}}
  if(index===4){for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(0,0,145,35+i*19,-.35,0,Math.PI*2);ctx.stroke();}}
  if(index===5){ctx.font='bold 184px Georgia';ctx.textAlign='center';ctx.fillText('mr',0,55);}
  ctx.restore();
  ctx.font='500 68px Arial';ctx.fillStyle=book.ink;
  const words=book.title.split(' '), lines=[];let line='';
  for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>635&&line){lines.push(line);line=word;}else line=test;}lines.push(line);
  lines.forEach((text,i)=>ctx.fillText(text,65,685-(lines.length-1-i)*74));
  ctx.globalAlpha=.5;ctx.fillRect(65,729,645,1);
  return canvas;
}
books.forEach((book,i)=>{
  if(i%2===0){const row=document.createElement('div');row.className='shelf-row';shelves.append(row);}
  const cover=makeCover(book,i);covers.push(cover);
  const button=document.createElement('button');button.type='button';button.className='shelf-book';button.style.setProperty('--book-color',book.color);button.setAttribute('aria-label',`Open book: ${book.title}`);button.setAttribute('aria-haspopup','dialog');
  const img=document.createElement('img');img.src=cover.toDataURL();img.alt='';img.width=img.height=768;button.append(img);
  button.addEventListener('click',()=>openBook(i));
  button.addEventListener('pointerenter',()=>sceneAPI?.hover(i));button.addEventListener('pointerleave',()=>sceneAPI?.hover(-1));
  button.addEventListener('focus',()=>sceneAPI?.hover(i));button.addEventListener('blur',()=>sceneAPI?.hover(-1));
  shelves.lastElementChild.append(button);buttons.push(button);
});

function animate(element,frames,options){const animation=element.animate(frames,{fill:'both',easing:'cubic-bezier(.22,.75,.2,1)',...options});animations.push(animation);return animation;}
function cancelAnimations(){animations.forEach(a=>a.cancel());animations=[];}
function sourceTransform(){
  const source=buttons[selected].getBoundingClientRect();
  const target=spread.getBoundingClientRect();
  const mobileBook=matchMedia('(max-width: 600px)').matches;
  const x=target.left+target.width*(mobileBook?.5:.75);
  const y=target.top+target.height/2;
  return `translate(${source.left+source.width/2-x}px, ${source.top+source.height/2-y}px) scale(${source.width/(target.width/(mobileBook?1:2))}, ${source.height/target.height})`;
}
async function openBook(index){
  if(phase!=='idle')return;
  phase='opening';selected=index;const book=books[index];
  document.querySelector('#book-title').textContent=book.title;
  document.querySelector('#book-description').textContent=book.description;
  document.querySelector('#book-category').textContent=`VOL. 0${index+1} / ${book.category}`;
  document.querySelector('#preview-category').textContent=book.category;
  const preview=document.querySelector('#preview-image');preview.src=book.image;preview.alt=book.title;
  const mobilePreview=document.querySelector('#mobile-preview-image');mobilePreview.src=book.image;mobilePreview.alt='';
  document.querySelector('#book-link').href=book.url;
  document.querySelector('#flying-cover-image').src=covers[index].toDataURL();
  spread.classList.remove('settled');
  document.body.classList.add('reading');dialog.showModal();
  const origin=sourceTransform();
  buttons[index].classList.add('taken');sceneAPI?.select(index);
  const duration=reducedMotion.matches?0:620;
  animate(spread,[{transform:origin},{transform:'none'}],{duration});
  animate(front,[{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}],{duration:reducedMotion.matches?0:650,delay:reducedMotion.matches?0:300});
  animate(left,[{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{duration:reducedMotion.matches?0:650,delay:reducedMotion.matches?0:300});
  const finalAnimation=animations.at(-1);
  try{await finalAnimation.finished;}catch{return;}
  if(phase==='opening'){phase='open';spread.classList.add('settled');}
}
async function closeBook(){
  if(phase==='idle'||phase==='closing')return;
  phase='closing';spread.classList.remove('settled');
  const current={spread:getComputedStyle(spread).transform,front:getComputedStyle(front).transform,left:getComputedStyle(left).transform};
  cancelAnimations();
  const origin=sourceTransform();const duration=reducedMotion.matches?0:400;
  animate(front,[{transform:current.front},{transform:'rotateY(0deg)'}],{duration});
  animate(left,[{transform:current.left},{transform:'rotateY(180deg)'}],{duration});
  const last=animate(spread,[{transform:current.spread},{transform:origin}],{duration:reducedMotion.matches?0:550,delay:reducedMotion.matches?0:240});
  try{await last.finished;}catch{return;}
  const previous=selected;dialog.close();document.body.classList.remove('reading');buttons[previous].classList.remove('taken');selected=-1;sceneAPI?.select(-1);cancelAnimations();phase='idle';buttons[previous].focus({preventScroll:true});
}
closeButton.addEventListener('click',closeBook);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeBook();});
dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.classList.contains('reading-space'))closeBook();});
// Native modal semantics keep keyboard focus on the close control and the destination link.
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const link=document.querySelector('#book-link');
  if(event.shiftKey&&document.activeElement===closeButton){event.preventDefault();link.focus();}
  else if(!event.shiftKey&&document.activeElement===link){event.preventDefault();closeButton.focus();}
});

async function initThree(){
  const THREE=await import('../vendor/three/three.module.min.js');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='shelf-canvas';renderer.domElement.setAttribute('aria-hidden','true');stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(0,1,1,0,.1,3000);camera.position.z=1000;
  scene.add(new THREE.AmbientLight(0xffffff,2.3));
  const light=new THREE.DirectionalLight(0xfff9eb,2);light.position.set(-300,800,900);scene.add(light);
  const objects=books.map((book,i)=>{
    const group=new THREE.Group();
    const paper=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xe1ddce,roughness:1}));group.add(paper);
    const coverTexture=new THREE.CanvasTexture(covers[i]);coverTexture.colorSpace=THREE.SRGBColorSpace;coverTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:coverTexture}));face.position.z=8;group.add(face);
    const back=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:book.color,roughness:.9}));back.position.z=-3;group.add(back);
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,12,64,64,64);gradient.addColorStop(0,'#22281c50');gradient.addColorStop(1,'#22281c00');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.z=-20;scene.add(shadow);
    scene.add(group);return{group,paper,face,back,shadow,baseY:0};
  });
  const shelfMeshes=[...shelves.children].map(()=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xc9ccbf,roughness:.85}));scene.add(mesh);return mesh;});
  let hovered=-1,frame=0;
  function draw(){renderer.render(scene,camera);}
  function update(){
    frame=0;let moving=false;
    objects.forEach((object,i)=>{const target=object.baseY+(hovered===i&&selected<0?5:0);const delta=target-object.group.position.y;object.group.position.y+=reducedMotion.matches?delta:delta*.2;if(Math.abs(delta)>.05)moving=true;});draw();if(moving)frame=requestAnimationFrame(update);
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(update);}
  function layout(){
    const bounds=stage.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height,false);camera.right=bounds.width;camera.top=bounds.height;camera.updateProjectionMatrix();
    buttons.forEach((button,i)=>{const rect=button.getBoundingClientRect(),object=objects[i],size=button.offsetWidth;object.group.position.set(rect.left-bounds.left+rect.width/2,bounds.height-(rect.top-bounds.top)-rect.height/2,20);object.baseY=object.group.position.y;object.paper.scale.set(size-3,size-3,10);object.face.scale.set(size,size,1);object.back.scale.set(size+1,size+1,2);object.shadow.scale.set(size*1.45,size*.45,1);object.shadow.position.set(object.group.position.x+7,object.baseY-size*.47,-20);});
    shelfMeshes.forEach((mesh,i)=>{const rect=shelves.children[i].getBoundingClientRect();mesh.scale.set(rect.width-20,7,18);mesh.position.set(bounds.width/2,bounds.height-(rect.bottom-bounds.top)+3.5,4);});draw();
  }
  const observer=new ResizeObserver(layout);observer.observe(stage);
  sceneAPI={hover(index){hovered=index;requestDraw();},select(index){objects.forEach((object,i)=>{object.group.visible=i!==index;object.shadow.visible=i!==index;});requestDraw();}};
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.classList.remove('webgl-ready');renderer.domElement.style.visibility='hidden';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{renderer.domElement.style.visibility='';layout();stage.classList.add('webgl-ready');});
  layout();stage.classList.add('webgl-ready');if(selected>=0)sceneAPI.select(selected);
}
initThree().catch(error=>{console.info('Using the accessible bookshelf fallback.',error.message);stage.querySelector('canvas')?.remove();stage.classList.remove('webgl-ready');});
