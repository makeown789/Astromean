import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;
const NIM_BASE_URL = (process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
const NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY || '';
const NIM_MODEL = process.env.NVIDIA_NIM_MODEL || '';
const HUB_BASE_URL = (process.env.AIHUBMIX_BASE_URL || '').replace(/\/$/, '');
const HUB_API_KEY = process.env.AIHUBMIX_API_KEY || '';
const HUB_MODEL = process.env.AIHUBMIX_MODEL || '';
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

app.use(express.json({limit:'1mb'}));
app.use(express.static('public'));

function providerConfig(name){
  if(name==='aihubmix') return HUB_BASE_URL && HUB_API_KEY && HUB_MODEL ? {base:HUB_BASE_URL,key:HUB_API_KEY,model:HUB_MODEL,name:'AIHubMix'} : null;
  return NIM_API_KEY && NIM_MODEL ? {base:NIM_BASE_URL,key:NIM_API_KEY,model:NIM_MODEL,name:'NVIDIA NIM'} : null;
}

async function chat(provider, messages, opts={}){
  const cfg=providerConfig(provider); if(!cfg) throw new Error(`${provider} is not configured`);
  const r=await fetch(`${cfg.base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cfg.key}`},body:JSON.stringify({model:cfg.model,messages,temperature:opts.temperature??0.25,max_tokens:opts.max_tokens??1200})});
  const text=await r.text(); if(!r.ok) throw new Error(`${cfg.name} ${r.status}: ${text.slice(0,500)}`);
  const data=JSON.parse(text); return {provider:cfg.name,model:data.model||cfg.model,text:data.choices?.[0]?.message?.content||''};
}

app.get('/api/health',(req,res)=>res.json({ok:true,providers:{nvidia:!!providerConfig('nvidia'),aihubmix:!!providerConfig('aihubmix')},scientificEngine:'local-v1'}));
app.get('/api/nasa/apod',async(req,res)=>{try{const r=await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(NASA_API_KEY)}`);res.status(r.status).type('json').send(await r.text())}catch(e){res.status(502).json({error:e.message})}});
app.get('/api/nasa/neo',async(req,res)=>{try{const start=req.query.start||new Date().toISOString().slice(0,10);const r=await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(start)}&api_key=${encodeURIComponent(NASA_API_KEY)}`);res.status(r.status).type('json').send(await r.text())}catch(e){res.status(502).json({error:e.message})}});

app.post('/api/ai',async(req,res)=>{
  const {messages=[],provider='nvidia',fallback=true,temperature,max_tokens}=req.body||{};
  try{return res.json(await chat(provider,messages,{temperature,max_tokens}))}
  catch(primary){
    if(fallback){try{const other=provider==='nvidia'?'aihubmix':'nvidia';return res.json({...await chat(other,messages,{temperature,max_tokens}),fallbackFrom:provider})}catch(secondary){return res.status(503).json({error:'Both AI providers failed',details:[primary.message,secondary.message]})}}
    return res.status(503).json({error:primary.message});
  }
});

app.get('*',(req,res)=>res.sendFile(process.cwd()+'/public/index.html'));
app.listen(PORT,()=>console.log(`AstroSun listening on ${PORT}`));
