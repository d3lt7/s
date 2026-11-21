const CONFIG={email:'',whatsapp:'',instagram:''}; // links do footer: e-mail, WhatsApp com DDD (ex.: 5538999999999) e @instagram. O formulário usa /api/contact
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],rt=document.documentElement;
const L={email:CONFIG.email&&'mailto:'+CONFIG.email,whatsapp:CONFIG.whatsapp&&'https://wa.me/'+CONFIG.whatsapp.replace(/\D/g,''),instagram:CONFIG.instagram&&'https://instagram.com/'+CONFIG.instagram.replace('@','')};
$$('[data-c]').forEach(a=>{const u=L[a.dataset.c];u?a.href=u:a.remove()});
$('#yr').textContent=new Date().getFullYear();
try{const s=localStorage.getItem('rc-theme');if(s)rt.dataset.theme=s}catch(e){}
$('#th').onclick=()=>{const cur=rt.dataset.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'),n=cur==='dark'?'light':'dark';rt.dataset.theme=n;try{localStorage.setItem('rc-theme',n)}catch(e){}};
const mb=$('#mb');mb.onclick=()=>mb.setAttribute('aria-expanded',document.body.classList.toggle('open'));
$$('#menu a').forEach(a=>a.onclick=()=>{document.body.classList.remove('open');mb.setAttribute('aria-expanded','false')});
/* palco do herói: pedestal e cubos flutuantes */
const G='#1d2530',G2='#263140',B='var(--bl)',Y='var(--cy)';
const cubes=[];[7,5].forEach((n,y)=>{for(let i=0;i<n;i++)cubes.push([i-(n-1)/2,y,1,y?(i%2?G2:B):(i%2?G2:G),.1*i+.12*y,0])});
[[-3.3,5.4,.45,Y],[3.2,6.6,.38,B],[-3.7,3.3,.3,'#fff'],[3.6,4,.5,Y],[2.4,8,.28,B],[-2.2,7.6,.34,Y]].forEach(([x,y,z,c],i)=>cubes.push([x,y,z,c,1.1+i*.15,1]));
$('#stage').insertAdjacentHTML('afterbegin',cubes.map(([x,y,z,c,d,f])=>`<b class="vx${f?' fl':''}" style="--x:${x};--y:${y};--z:${z};--c:${c};--d:${d}s"></b>`).join(''));
/* barras de performance entram em cena ao rolar */
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.35}):null;
$$('.m').forEach(m=>io?io.observe(m):m.classList.add('in'));
/* formulário: envia para a função /api/contact (Neon + e-mail automático) */
const fm=$('#fm'),st=$('#st'),sb=fm.querySelector('button[type=submit]');
fm.onsubmit=async e=>{e.preventDefault();const v=id=>$('#'+id).value.trim();
if(!v('nm')||!/^\S+@\S+\.\S+$/.test(v('em'))||!v('ms')){st.textContent='Preencha nome, um e-mail válido e a mensagem.';return}
sb.disabled=true;st.textContent='Enviando...';
try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:v('nm'),email:v('em'),type:$('#tp').value,message:v('ms'),website:$('#hp').value})});
const j=await r.json().catch(()=>({}));
if(r.ok){fm.reset();st.textContent='Mensagem enviada! Você vai receber um e-mail de confirmação.'}else st.textContent=j.error||'Não foi possível enviar agora. Tente novamente.'}
catch{st.textContent='Sem conexão com o servidor. Tente novamente em instantes.'}
sb.disabled=false};
