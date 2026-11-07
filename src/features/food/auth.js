// Google Identity Services is loaded only on demand. The token stays in memory,
// never in localStorage, URLs, workout data, food records, or logs.
export function createFoodPhotoAuth({showSheet,manualFallback}){
 let token='',clientId='',expiry=0,library=null;
 const clear=()=>{token='';expiry=0};
 const current=()=>token&&Date.now()<expiry-60000?token:'';
 async function loadGoogle(){
  if(globalThis.google?.accounts?.id)return globalThis.google;
  if(!library)library=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://accounts.google.com/gsi/client';
   script.async=true;script.defer=true;
   script.onload=()=>globalThis.google?.accounts?.id?resolve(globalThis.google):reject(Error('Google unavailable'));
   script.onerror=()=>reject(Error('Google unavailable'));
   document.head.appendChild(script);
  });
  try{return await library}catch(error){library=null;throw error}
 }
 function tokenExpiry(candidate){
  try{
   const part=candidate.split('.')[1];
   const payload=JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/')));
   return Number(payload.exp)*1000;
  }catch{return 0}
 }
 async function requireToken(onSignedIn){
  if(current())return token;
  let config;
  try{
   const result=await fetch('/api/food/config',{cache:'no-store'});
   if(!result.ok)throw Error('unavailable');
   config=await result.json();
  }catch{config={enabled:false}}
  if(!config?.enabled||typeof config.clientId!=='string'){
   showSheet('AI photo analysis unavailable',
     '<p class="mu">Photo analysis is not configured. You can still enter this meal manually.</p>'+
     '<button class="btn" onclick="fman(1)">Add manually</button>');
   return null;
  }
  clientId=config.clientId;
  showSheet('Sign in to analyze food',
    '<p class="mu">Sign in with Google to use photo analysis. Workout history and meals remain on this device. '+
    'Photo requests have a daily usage limit.</p><div id="strongfitsGoogleSignin"></div>'+
    '<button class="pill" style="margin-top:14px" onclick="fman(1)">Add manually instead</button>');
  try{
   const google=await loadGoogle();
   const target=document.getElementById('strongfitsGoogleSignin');
   if(!target)return null; // User closed the sheet during loading.
   google.accounts.id.initialize({
    client_id:clientId,
    callback:response=>{
     const credential=typeof response?.credential==='string'?response.credential:'';
     const exp=tokenExpiry(credential);
     if(!credential||exp<Date.now()+60000)return;
     token=credential;expiry=exp;
     if(typeof onSignedIn==='function')onSignedIn();
    }
   });
   google.accounts.id.renderButton(target,{type:'standard',theme:'outline',size:'large',text:'signin_with'});
  }catch{
   clear();
   showSheet('Sign-in unavailable',
     '<p class="mu">Google sign-in could not load. You can add the meal manually.</p>'+
     '<button class="btn" onclick="fman(1)">Add manually</button>');
  }
  return null;
 }
 return {requireToken,clear};
}
