const screens = document.querySelectorAll(".screen");
const canvas = document.getElementById("fxCanvas");
const ctx = canvas.getContext("2d");
let fireworks = false, particles = [], raf;

function show(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("startBtn").onclick=()=>show("quizScreen");

document.querySelectorAll("#quizScreen .answer").forEach(btn=>{
  btn.onclick=()=>{
    const msg=document.getElementById("quizMessage");
    if(btn.classList.contains("correct")){
      msg.textContent="Correct! 🎉 Let’s move on!";
      burst(innerWidth/2,innerHeight/2,70);
      setTimeout(()=>show("missionScreen"),900);
    }else{
      msg.textContent="Haha, not quite! Try again 😝";
    }
  }
});

document.querySelectorAll("#missionScreen .answer").forEach(btn=>{
  btn.onclick=()=>{
    const msg=document.getElementById("missionMessage");
    if(btn.classList.contains("correct")){
      msg.textContent="Correct! 🎉 Let’s continue the quest!";
      burst(innerWidth/2,innerHeight/2,70);
      setTimeout(()=>show("collectScreen"),900);
    }else{
      msg.textContent="Not quite! Try again 😝";
    }
  };
});

let score=0;
const area=document.getElementById("playArea");
const scoreEl=document.getElementById("score");
function spawnStar(){
  if(score>=10)return;
  const s=document.createElement("button");
  s.className="star";s.textContent="⭐";
  s.style.left=Math.random()*82+5+"%";
  s.style.top=Math.random()*78+5+"%";
  s.style.setProperty("--move-x",`${Math.random()*120-60}px`);
  s.style.setProperty("--move-y",`${Math.random()*120-60}px`);
  s.onclick=()=>{
    score++; scoreEl.textContent=`⭐ ${score} / 10`;
    const starBounds=s.getBoundingClientRect();
    burst(starBounds.left+starBounds.width/2,starBounds.top+starBounds.height/2,25);
    s.remove();
    if(score>=10){
      setTimeout(()=>show("giftPickScreen"),700);
    }else setTimeout(spawnStar,250);
  };
  area.appendChild(s);
}
const collectObserver = new MutationObserver(()=>{
  if(document.getElementById("collectScreen").classList.contains("active") && score===0 && area.children.length===0) spawnStar();
});
collectObserver.observe(document.getElementById("collectScreen"),{attributes:true,attributeFilter:["class"]});

document.querySelectorAll(".gift-box").forEach(box=>{
  box.onclick=()=>{
    const msg=document.getElementById("giftMessage");
    if(box.classList.contains("winner")){
      msg.textContent="🎉 You found it! Let’s open the surprise!";
      burst(innerWidth/2,innerHeight/2,100);
      setTimeout(finalScene,800);
    }else{
      const wrongMessages=[
        "This box isn't the right one. Try another box 👀",
        "Not this box yet! Choose another one 🎁",
        "Almost! This isn't the correct box ✨"
      ];
      msg.textContent=wrongMessages[Math.floor(Math.random()*wrongMessages.length)];
      box.style.transform="rotate(12deg)";
    }
  }
});

function finalScene(){
  show("completeScreen");
  fireworks=true;
  startFx();
  launchMusic();
  for(let i=0;i<7;i++) setTimeout(()=>burst(Math.random()*innerWidth,Math.random()*innerHeight*.75,90),i*450);
}

document.getElementById("revealBtn").onclick=()=>{
  const code=document.getElementById("codeBox");
  // แก้ไขโค้ดจริงของคุณตรงนี้ได้
  code.textContent="XNZCHLYHDFXD2HNG";
  code.style.color="#ffd66b";
  document.getElementById("revealBtn").textContent="OPENED! 🎉";
  document.getElementById("copyBtn").disabled=false;
  burst(innerWidth/2,innerHeight*.65,140);
};

document.getElementById("copyBtn").onclick=async()=>{
  const code=document.getElementById("codeBox").textContent;
  try{
    await navigator.clipboard.writeText(code);
    document.getElementById("copyBtn").textContent="COPIED! ✓";
  }catch(e){
    document.getElementById("copyBtn").textContent="COPY FAILED";
  }
};

document.getElementById("replayBtn").onclick=()=>{
  fireworks=false; score=0; scoreEl.textContent="⭐ 0 / 10"; area.innerHTML="";
  document.getElementById("quizMessage").textContent="";
  document.getElementById("missionMessage").textContent="";
  document.getElementById("giftMessage").textContent="";
  document.getElementById("codeBox").textContent="XXXX-XXXX-XXXX-XXXX";
  document.getElementById("revealBtn").textContent="OPEN YOUR GIFT 🎁";
  document.getElementById("copyBtn").textContent="COPY CODE";
  document.getElementById("copyBtn").disabled=true;
  show("startScreen");
};

function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
addEventListener("resize",resize);resize();

function burst(x,y,n=60){
  const colors=["#ff4fa3","#ffd15c","#7c5cff","#72d8ff","#ffffff","#ff7a4f"];
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, speed=Math.random()*7+2;
    particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-2,
      life:Math.random()*50+45,size:Math.random()*4+2,color:colors[Math.floor(Math.random()*colors.length)]});
  }
  if(!raf) startFx();
}
function startFx(){
  if(raf)return;
  const loop=()=>{
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(fireworks && Math.random()<.025) burst(Math.random()*innerWidth,80+Math.random()*innerHeight*.55,75);
    particles=particles.filter(p=>p.life>0);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=.10;p.vx*=.99;p.life--;
      ctx.globalAlpha=Math.max(p.life/90,0);
      ctx.fillStyle=p.color;
      ctx.fillRect(p.x,p.y,p.size,p.size);
    });
    ctx.globalAlpha=1;
    if(particles.length||fireworks) raf=requestAnimationFrame(loop);
    else {cancelAnimationFrame(raf);raf=null}
  };
  raf=requestAnimationFrame(loop);
}

// Simple birthday-like WebAudio melody (starts only after user interaction)
function launchMusic(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    const ac=new AC();
    const notes=[261.63,329.63,293.66,261.63,392,349.23,261.63,329.63,293.66,261.63,440,392];
    let t=ac.currentTime+.1;
    notes.forEach((f,i)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type="triangle";o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t+i*.26);
      g.gain.exponentialRampToValueAtTime(.10,t+i*.26+.02);
      g.gain.exponentialRampToValueAtTime(.0001,t+i*.26+.23);
      o.connect(g).connect(ac.destination);o.start(t+i*.26);o.stop(t+i*.26+.25);
    });
  }catch(e){}
}
