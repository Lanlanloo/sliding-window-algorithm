const $=id=>document.getElementById(id);
  let data=[], events=[], best={text:'',start:0,end:-1}, current=0, timer=null;
  function analyze(){
    if(timer){clearInterval(timer);timer=null;$('play').textContent='▶ 播放';}
    const s=$('source').value; data=Array.from(s); const last=new Map(); let left=0, maxLen=0, bestStart=0; events=[];
    data.forEach((ch,right)=>{const previous=last.get(ch); let duplicate=false;if(previous!==undefined&&previous>=left){left=previous+1;duplicate=true;}last.set(ch,right);const len=right-left+1;if(len>maxLen){maxLen=len;bestStart=left;}events.push({left,right,ch,duplicate,window:data.slice(left,right+1).join(''),bestStart,maxLen,bestEnd:bestStart+maxLen-1});});
    best={text:data.slice(bestStart,bestStart+maxLen).join(''),start:bestStart,end:bestStart+maxLen-1};current=Math.max(0,events.length-1);
    $('bestText').textContent=best.text||'—';$('bestLength').innerHTML=maxLen+'<span class="unit">字元</span>';$('bestRange').textContent=maxLen?`索引 ${best.start} – ${best.end}`:'沒有字元';$('totalLength').innerHTML=data.length+'<span class="unit">字元</span>';
    renderFrequency();renderTimeline();$('scrub').max=Math.max(0,events.length-1);$('scrub').value=current;renderStep();searchKeyword();
  }
  function renderFrequency(){const m=new Map();data.forEach(c=>m.set(c,(m.get(c)||0)+1));$('frequency').innerHTML=m.size?[...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,18).map(([c,n])=>`<span class="chip">${esc(c===' '?'␠':c)}<b>${n}</b></span>`).join(''):'<span class="empty-state">輸入文字後，這裡會顯示字元次數。</span>';}
  function renderTimeline(){if(!events.length){$('timeline').innerHTML='<div class="empty-state">輸入文字後，會逐步記錄左右指標與目前視窗。</div>';return;}$('timeline').innerHTML=events.map((e,i)=>`<div class="timeline-row ${i===current?'active':''} ${i>=best.start&&i<=best.end?'best-row':''}" data-i="${i}"><span class="row-i">${String(i+1).padStart(2,'0')}</span><span>${e.left} → ${e.right}</span><span class="row-frag">「${esc(e.window)}」${e.duplicate?' ↶':''}</span><span class="row-best">${e.maxLen} 字</span></div>`).join('');$('timeline').querySelectorAll('.timeline-row').forEach(el=>el.addEventListener('click',()=>setStep(+el.dataset.i)));}
  function renderStep(){const e=events[current];if(!e){$('track').innerHTML='<span class="empty-state">輸入文字開始觀察視窗。</span>';$('leftRead').textContent='—';$('rightRead').textContent='—';$('windowRead').textContent='—';$('stepCount').textContent='STEP 0 / 0';renderTimeline();return;}$('track').innerHTML=data.map((c,i)=>{const inW=i>=e.left&&i<=e.right, inBest=i>=best.start&&i<=best.end, cls=['char',inW?'in-window':'',inBest?'best':'',i===e.left?'left-edge':'',i===e.right?'right-edge':'',e.duplicate&&i===e.right?'duplicate':''].filter(Boolean).join(' ');return `<span class="${cls}" title="索引 ${i}">${esc(c===' '?'␠':c)}</span>`}).join('');$('leftRead').textContent=e.left;$('rightRead').textContent=e.right;$('windowRead').textContent=e.window||'∅';$('stepCount').textContent=`STEP ${current+1} / ${events.length}`;$('scrub').value=current;renderTimeline();const row=$('timeline').querySelector('.active');if(row)row.scrollIntoView({block:'nearest'});}
  function setStep(n){if(!events.length)return;current=Math.max(0,Math.min(events.length-1,n));renderStep();}
  function searchKeyword(){const q=Array.from($('keyword').value);if(!q.length){$('keywordResult').textContent='輸入關鍵字來尋找它出現的位置。';return;}let hits=[];for(let i=0;i<=data.length-q.length;i++)if(data.slice(i,i+q.length).join('')===q.join(''))hits.push(i);$('keywordResult').innerHTML=hits.length?`找到 <b>${hits.length}</b> 次，起始索引：<b>${hits.join(', ')}</b>`:`找不到「${esc(q.join(''))}」`}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  $('source').addEventListener('input',analyze);$('search').addEventListener('click',searchKeyword);$('keyword').addEventListener('input',searchKeyword);$('prev').addEventListener('click',()=>setStep(current-1));$('next').addEventListener('click',()=>setStep(current+1));$('scrub').addEventListener('input',e=>setStep(+e.target.value));$('timeline').addEventListener('click',e=>{const row=e.target.closest('.timeline-row');if(row)setStep(+row.dataset.i)});$('sample').addEventListener('click',()=>{$('source').value='mX9!pL2@mX9qW#bA5&zT1*pL2KvN$8fR3_mX9!pL2@aB7(xY4)qW#mX9!pL2@bA5&zT1*KvN$8fR3_mX9!pL2@aB7(xY4)qW#bA5&zT1';$('keyword').value='b';analyze()});$('source').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')analyze()});$('play').addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;$('play').textContent='▶ 播放';return;}if(!events.length)return;if(current>=events.length-1)setStep(0);$('play').textContent='Ⅱ 暫停';timer=setInterval(()=>{if(current>=events.length-1){clearInterval(timer);timer=null;$('play').textContent='▶ 播放';return;}setStep(current+1)},650)});analyze();
  $('randomize').addEventListener('click',()=>{
    const alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.?/';
    const length=70+Math.floor(Math.random()*50);
    const chars=Array.from({length},()=>alphabet[Math.floor(Math.random()*alphabet.length)]);
    // 隨機字串通常不容易出現重複，偶爾複製一小段來觀察視窗左指標的移動。
    if(Math.random()<0.7){const start=Math.floor(Math.random()*(length-4));chars.splice(start+4,0,...chars.slice(start,start+4));}
    $('source').value=chars.join('');
    analyze();
  });



