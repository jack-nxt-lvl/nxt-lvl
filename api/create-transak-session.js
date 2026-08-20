// Secure server-side Transak session creator.
// Required: TRANSAK_API_KEY, TRANSAK_API_SECRET, TRANSAK_BTC_WALLET,
// TRANSAK_ETH_WALLET, TRANSAK_USDT_WALLET.
// Optional: TRANSAK_ENV=staging (live site defaults to production),
// TRANSAK_USDT_NETWORK=ethereum, TRANSAK_REFERRER_DOMAIN.

const ACCESS_CACHE = { token: null, expiresAt: 0, env: null };
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store, max-age=0');return res.end(JSON.stringify(body))}
function ip(req){const x=req.headers['x-forwarded-for'];if(typeof x==='string'&&x.trim())return x.split(',')[0].trim();return req.headers['x-real-ip']||req.socket?.remoteAddress||'127.0.0.1'}
function errorMessage(data,fallback){const value=data?.message||data?.error;if(typeof value==='string'&&value.trim())return value;if(value&&typeof value==='object'){const nested=value.message||value.error||value.description;if(typeof nested==='string'&&nested.trim())return nested;try{return JSON.stringify(value)}catch(_){}}return fallback}
async function token(apiKey,apiSecret,env){const now=Math.floor(Date.now()/1000);if(ACCESS_CACHE.token&&ACCESS_CACHE.env===env&&ACCESS_CACHE.expiresAt>now+60)return ACCESS_CACHE.token;const base=env==='staging'?'https://api-stg.transak.com':'https://api.transak.com';const r=await fetch(`${base}/partners/api/v2/refresh-token`,{method:'POST',headers:{accept:'application/json','api-secret':apiSecret,'x-api-key':apiKey,'content-type':'application/json'},body:JSON.stringify({apiKey})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.data?.accessToken)throw new Error(errorMessage(d,'Transak authentication failed.'));ACCESS_CACHE.token=d.data.accessToken;ACCESS_CACHE.env=env;ACCESS_CACHE.expiresAt=Number(d.data.expiresAt)||now+900;return ACCESS_CACHE.token}
function cryptoConfig(code){switch(String(code||'').toUpperCase()){case'BTC':return{cryptoCurrencyCode:'BTC',network:'bitcoin',walletAddress:process.env.TRANSAK_BTC_WALLET,walletEnv:'TRANSAK_BTC_WALLET'};case'ETH':return{cryptoCurrencyCode:'ETH',network:'ethereum',walletAddress:process.env.TRANSAK_ETH_WALLET,walletEnv:'TRANSAK_ETH_WALLET'};case'USDT':return{cryptoCurrencyCode:'USDT',network:String(process.env.TRANSAK_USDT_NETWORK||'ethereum').toLowerCase(),walletAddress:process.env.TRANSAK_USDT_WALLET,walletEnv:'TRANSAK_USDT_WALLET'};default:return null}}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  const apiKey=process.env.TRANSAK_API_KEY,apiSecret=process.env.TRANSAK_API_SECRET;
  const env=String(process.env.TRANSAK_ENV||'production').toLowerCase()==='staging'?'staging':'production';
  const cfg=cryptoConfig(req.body?.crypto);
  if(!cfg)return json(res,400,{error:'Choose BTC, ETH, or USDT.'});
  const missing=[!apiKey&&'TRANSAK_API_KEY',!apiSecret&&'TRANSAK_API_SECRET',!cfg.walletAddress&&cfg.walletEnv].filter(Boolean);
  if(missing.length)return json(res,503,{error:'Transak is not fully configured yet.',setupRequired:true,missing});
  const amount=Number(req.body?.amount);if(!Number.isFinite(amount)||amount<5||amount>10000)return json(res,400,{error:'Invalid checkout amount.'});
  const orderId=String(req.body?.orderId||`NXT-${Date.now()}`).replace(/[^A-Za-z0-9_-]/g,'').slice(0,100);
  const email=typeof req.body?.email==='string'?req.body.email.trim().slice(0,180):'';
  const host=String(process.env.TRANSAK_REFERRER_DOMAIN||req.headers['x-forwarded-host']||req.headers.host||'').replace(/^https?:\/\//,'').split('/')[0].split(',')[0].trim();
  try{
    const accessToken=await token(apiKey,apiSecret,env);
    const gateway=env==='staging'?'https://api-gateway-stg.transak.com':'https://api-gateway.transak.com';
    const widgetParams={apiKey,referrerDomain:host,productsAvailed:'BUY',fiatAmount:Number(amount.toFixed(2)),fiatCurrency:'USD',cryptoCurrencyCode:cfg.cryptoCurrencyCode,network:cfg.network,walletAddress:cfg.walletAddress,disableWalletAddressForm:true,partnerOrderId:orderId,hideExchangeScreen:true,themeColor:'7C3AED'};
    if(email)widgetParams.email=email;
    const createSession=formattedToken=>fetch(`${gateway}/api/v2/auth/session`,{method:'POST',headers:{accept:'application/json','access-token':formattedToken,'x-api-key':apiKey,'x-user-ip':ip(req),'content-type':'application/json'},body:JSON.stringify({widgetParams})});
    let r=await createSession(accessToken);let d=await r.json().catch(()=>({}));
    if(!r.ok&&!String(accessToken).startsWith('Bearer ')){r=await createSession(`Bearer ${accessToken}`);d=await r.json().catch(()=>({}));}
    const widgetUrl=d?.data?.widgetUrl;
    if(!r.ok||!widgetUrl)return json(res,r.status||502,{error:errorMessage(d,'Unable to start Transak checkout.')});
    return json(res,200,{widgetUrl,orderId,environment:env,crypto:cfg.cryptoCurrencyCode,network:cfg.network});
  }catch(e){console.error('Transak session error:',e);return json(res,502,{error:e.message||'Unable to start Transak checkout.'})}
};
