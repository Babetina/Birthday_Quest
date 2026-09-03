const screens = document.querySelectorAll(".screen");
const canvas = document.getElementById("fxCanvas");
const ctx = canvas.getContext("2d");
let fireworks = false, particles = [], raf;
let musicContext, musicGain, effectsGain, musicTimer, musicIndex = 0;
let musicPlaying = true, effectsPlaying = true;

function show(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("startBtn").onclick=()=>{
  show("quizScreen");
  startMusic();
  playEffect("start");
};

function animateAnswer(btn,isCorrect){
  btn.classList.remove("answer-correct","answer-wrong");
  void btn.offsetWidth;
  btn.classList.add(isCorrect ? "answer-correct" : "answer-wrong");
}

document.querySelectorAll("#quizScreen .answer").forEach(btn=>{
  btn.onclick=()=>{
    const msg=document.getElementById("quizMessage");
    if(btn.classList.contains("correct")){
      animateAnswer(btn,true);
      playEffect("correct");
      msg.textContent="Correct! 🎉 Let’s move on!";
      burst(innerWidth/2,innerHeight/2,70);
      setTimeout(()=>show("missionScreen"),900);
    }else{
      animateAnswer(btn,false);
      playEffect("wrong");
      const wrongMessages=[
        "Wrong answer! Give it another try 😝",
        "That choice is incorrect. Try again! 🔁",
        "Not the right answer yet. Choose again! ✨"
      ];
      msg.textContent=wrongMessages[Math.floor(Math.random()*wrongMessages.length)];
    }
  }
});

document.querySelectorAll("#missionScreen .answer").forEach(btn=>{
  btn.onclick=()=>{
    const msg=document.getElementById("missionMessage");
    if(btn.classList.contains("correct")){
      animateAnswer(btn,true);
      playEffect("correct");
      msg.textContent="Correct! 🎉 Let’s continue the quest!";
      burst(innerWidth/2,innerHeight/2,70);
      setTimeout(()=>show("collectScreen"),900);
    }else{
      animateAnswer(btn,false);
      playEffect("wrong");
      const wrongMessages=[
        "That answer is wrong. Try once more! 😝",
        "Incorrect choice! Have another go 🔁",
        "That is not the correct answer yet. ✨"
      ];
      msg.textContent=wrongMessages[Math.floor(Math.random()*wrongMessages.length)];
    }
  };
});

const targetStars=17;
let score=0;
const area=document.getElementById("playArea");
const scoreEl=document.getElementById("score");
function spawnStar(){
  if(score>=targetStars)return;
  const s=document.createElement("button");
  s.className="star";s.textContent="⭐";
  s.style.left=Math.random()*82+5+"%";
  s.style.top=Math.random()*78+5+"%";
  s.style.setProperty("--move-x",`${Math.random()*120-60}px`);
  s.style.setProperty("--move-y",`${Math.random()*120-60}px`);
  s.onclick=()=>{
    score++; scoreEl.textContent=`⭐ ${score} / ${targetStars}`;
    playEffect("collect");
    const starBounds=s.getBoundingClientRect();
    burst(starBounds.left+starBounds.width/2,starBounds.top+starBounds.height/2,25);
    s.remove();
    if(score>=targetStars){
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
      box.classList.add("gift-correct");
      playEffect("win");
      msg.textContent="🎉 You found it! Let’s open the surprise!";
      burst(innerWidth/2,innerHeight/2,100);
      setTimeout(finalScene,800);
    }else{
      playEffect("wrong");
      const wrongMessages=[
        "This box isn't the right one. Try another box 👀",
        "Not this box yet! Choose another one 🎁",
        "Almost! This isn't the correct box ✨"
      ];
      box.classList.remove("gift-wrong");
      void box.offsetWidth;
      box.classList.add("gift-wrong","gift-empty");
      box.textContent="📦";
      box.disabled=true;
      msg.textContent=wrongMessages[Math.floor(Math.random()*wrongMessages.length)];
    }
  }
});

function finalScene(){
  show("completeScreen");
  fireworks=true;
  startFx();
  playEffect("celebrate");
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
  fireworks=false; score=0; scoreEl.textContent=`⭐ 0 / ${targetStars}`; area.innerHTML="";
  document.querySelectorAll(".gift-box").forEach(box=>{
    box.textContent="🎁"; box.disabled=false;
    box.classList.remove("gift-empty","gift-wrong","gift-correct");
  });
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

const birthdayNotes=[
  [392,.28],[392,.28],[440,.55],[392,.55],[523,.55],[494,1.05],
  [392,.28],[392,.28],[440,.55],[392,.55],[587,.55],[523,1.05],
  [392,.28],[392,.28],[784,.55],[659,.55],[523,.55],[494,.55],[440,1.05],
  [698,.28],[698,.28],[659,.55],[523,.55],[587,.55],[523,1.05]
];

function playNextNote(){
  if(!musicContext || !musicGain || !musicPlaying)return;
  const [frequency,duration]=birthdayNotes[musicIndex];
  const now=musicContext.currentTime;
  const oscillator=musicContext.createOscillator();
  const noteGain=musicContext.createGain();
  oscillator.type="triangle";
  oscillator.frequency.value=frequency;
  noteGain.gain.setValueAtTime(.0001,now);
  noteGain.gain.exponentialRampToValueAtTime(.12,now+.025);
  noteGain.gain.exponentialRampToValueAtTime(.0001,now+duration-.03);
  oscillator.connect(noteGain).connect(musicGain);
  oscillator.start(now);
  oscillator.stop(now+duration);
  musicIndex=(musicIndex+1)%birthdayNotes.length;
  musicTimer=setTimeout(playNextNote,duration*1000);
}

function startMusic(){
  try{
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return;
    if(!musicContext){
      musicContext=new AudioContextClass();
      musicGain=musicContext.createGain();
      effectsGain=musicContext.createGain();
      musicGain.gain.value=Number(document.getElementById("volumeControl").value)/100;
      effectsGain.gain.value=1;
      musicGain.connect(musicContext.destination);
      effectsGain.connect(musicContext.destination);
    }
    if(musicContext.state==="suspended"){
      musicContext.resume().then(()=>{
        if(musicPlaying&&!musicTimer)playNextNote();
      });
      updateMusicButton();
      return;
    }
    if(musicPlaying&&!musicTimer)playNextNote();
    updateMusicButton();
  }catch(e){}
}

function updateMusicButton(){
  const button=document.getElementById("musicToggle");
  button.textContent="♫";
  const musicButton=document.getElementById("musicMute");
  const effectsButton=document.getElementById("effectsMute");
  musicButton.textContent=musicPlaying?"♫ MUSIC":"♫ MUSIC OFF";
  effectsButton.textContent=effectsPlaying?"✦ FX":"✦ FX OFF";
  musicButton.setAttribute("aria-pressed",String(!musicPlaying));
  effectsButton.setAttribute("aria-pressed",String(!effectsPlaying));
}

function scheduleTone(frequency,start,duration,waveform="sine",volume=.14){
  if(!musicContext||!effectsGain)return;
  const oscillator=musicContext.createOscillator();
  const effectGain=musicContext.createGain();
  oscillator.type=waveform;
  oscillator.frequency.setValueAtTime(frequency,start);
  effectGain.gain.setValueAtTime(.0001,start);
  effectGain.gain.exponentialRampToValueAtTime(volume,start+.015);
  effectGain.gain.exponentialRampToValueAtTime(.0001,start+duration-.02);
  oscillator.connect(effectGain).connect(effectsGain);
  oscillator.start(start);
  oscillator.stop(start+duration);
}

function playEffect(effect){
  if(!musicContext||!musicGain||musicContext.state!=="running")return;
  const now=musicContext.currentTime;
  const effects={
    start:[[523.25,0,.12],[659.25,.1,.12],[783.99,.2,.2]],
    correct:[[523.25,0,.12],[659.25,.1,.12],[783.99,.2,.24]],
    collect:[[783.99,0,.08],[1046.5,.07,.16]],
    wrong:[[329.63,0,.16],[246.94,.14,.25]],
    win:[[523.25,0,.12],[659.25,.1,.12],[783.99,.2,.12],[1046.5,.3,.36]],
    celebrate:[[523.25,0,.14],[659.25,.11,.14],[783.99,.22,.14],[1046.5,.33,.18],[1318.5,.48,.42]]
  };
  (effects[effect]||[]).forEach(([frequency,offset,duration])=>{
    scheduleTone(frequency,now+offset,duration,effect==="wrong"?"sawtooth":"triangle",effect==="win"?.17:.13);
  });
}

document.getElementById("musicToggle").onclick=()=>{
  const control=document.querySelector(".music-control");
  const expanded=control.classList.toggle("expanded");
  document.getElementById("musicToggle").setAttribute("aria-expanded",String(expanded));
  document.getElementById("musicToggle").setAttribute("aria-label",expanded?"Hide music controls":"Show music controls");
};
document.getElementById("volumeControl").oninput=(event)=>{
  if(musicGain)musicGain.gain.value=musicPlaying?Number(event.target.value)/100:0;
};
document.getElementById("musicMute").onclick=()=>{
  musicPlaying=!musicPlaying;
  if(musicGain)musicGain.gain.value=musicPlaying?Number(document.getElementById("volumeControl").value)/100:0;
  if(musicPlaying)startMusic();
  else if(musicTimer){clearTimeout(musicTimer);musicTimer=null;}
  updateMusicButton();
};
document.getElementById("effectsMute").onclick=()=>{
  effectsPlaying=!effectsPlaying;
  if(effectsGain)effectsGain.gain.value=effectsPlaying?1:0;
  updateMusicButton();
};

// Browsers may require one user interaction before allowing audio playback.
addEventListener("pointerdown",()=>startMusic(),{once:true});
startMusic();
