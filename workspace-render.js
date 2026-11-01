import{withWebmDuration}from'./workspace-container.js';
export async function renderVideo(project,getAsset,{onProgress=()=>{},signal}={}){
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('unsupported');
 const shots=project.shots.filter(s=>!s.archived);if(!shots.length||shots.some(s=>!s.assetId))throw Error('media');
 const total=shots.reduce((n,s)=>n+s.duration,0);if(total>180)throw Error('duration');
 const canvas=document.createElement('canvas');[canvas.width,canvas.height]=project.ratio==='9:16'?[720,1280]:[1280,720];
 const ctx=canvas.getContext('2d',{alpha:false}),stream=canvas.captureStream(24);let audioContext=null,audioSource=null;if(project.audioAssetId){audioContext=new AudioContext();await audioContext.resume();try{const a=await getAsset(project.audioAssetId);if(!a?.blob)throw Error('media');const buffer=await audioContext.decodeAudioData(await a.blob.arrayBuffer()),dest=audioContext.createMediaStreamDestination(),gain=audioContext.createGain();gain.gain.value=Number.isFinite(project.audioVolume)?project.audioVolume:.8;audioSource=audioContext.createBufferSource();audioSource.buffer=buffer;audioSource.connect(gain);gain.connect(dest);dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t))}catch(e){await audioContext.close();stream.getTracks().forEach(t=>t.stop());throw e}}
 const mime=['video/mp4',project.audioAssetId?'video/webm;codecs=vp8,opus':'video/webm;codecs=vp8','video/webm','video/mp4'].find(m=>MediaRecorder.isTypeSupported(m));if(!mime)throw Error('unsupported');
 const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000}),chunks=[];
 let resolveStop,rejectStop,aborted=false;const stopped=new Promise((resolve,reject)=>{resolveStop=resolve;rejectStop=reject});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolveStop;recorder.onerror=()=>rejectStop(Error('recording'));
 const check=()=>{if(signal?.aborted||aborted)throw new DOMException('Cancelled','AbortError');if(document.hidden)throw Error('foreground')};
 const dispose=[];let elapsed=0,recordingStarted=0;
 try{
  const media=[];
  for(const shot of shots){check();const a=await getAsset(shot.assetId);if(!a?.blob)throw Error('media');const url=URL.createObjectURL(a.blob);dispose.push(()=>URL.revokeObjectURL(url));let element;
   if(a.mime.startsWith('image/')){element=new Image();element.src=url;await element.decode()}
   else if(a.mime.startsWith('video/')){element=document.createElement('video');element.src=url;element.muted=true;element.playsInline=true;element.loop=true;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('media')),12000);element.onloadeddata=()=>{clearTimeout(timer);resolve()};element.onerror=()=>{clearTimeout(timer);reject(Error('media'))}});dispose.push(()=>{element.pause();element.removeAttribute('src');element.load()})}
   else throw Error('media');media.push(element);
  }
  ctx.fillStyle='#090d14';ctx.fillRect(0,0,canvas.width,canvas.height);recordingStarted=performance.now();recorder.start(250);if(audioSource)audioSource.start();
  for(let i=0;i<shots.length;i++){check();const shot=shots[i],element=media[i];if(element instanceof HTMLVideoElement){element.currentTime=0;await element.play()}
   const start=performance.now();await new Promise((resolve,reject)=>{function frame(now){try{check();const t=Math.min((now-start)/1000,shot.duration);draw(ctx,canvas,element,shot.narration);onProgress(Math.min(1,(elapsed+t)/total));if(t>=shot.duration)resolve();else requestAnimationFrame(frame)}catch(e){reject(e)}}requestAnimationFrame(frame)});
   if(element instanceof HTMLVideoElement)element.pause();elapsed+=shot.duration;
  }
  recorder.stop();await stopped;check();const durationMs=performance.now()-recordingStarted;let blob=new Blob(chunks,{type:recorder.mimeType});if(recorder.mimeType.includes('webm'))blob=await withWebmDuration(blob,durationMs);return{blob,extension:recorder.mimeType.includes('mp4')?'mp4':'webm',duration:total,width:canvas.width,height:canvas.height};
 }finally{if(recorder.state!=='inactive'){recorder.stop();await stopped.catch(()=>{})}if(audioSource)try{audioSource.stop()}catch{}if(audioContext)await audioContext.close();stream.getTracks().forEach(t=>t.stop());dispose.forEach(f=>f())}
}
function draw(ctx,canvas,el,caption){const w=el.videoWidth||el.naturalWidth,h=el.videoHeight||el.naturalHeight,scale=Math.min(canvas.width/w,canvas.height/h),dw=w*scale,dh=h*scale;ctx.fillStyle='#090d14';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(el,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);if(!caption.trim())return;
 const size=canvas.width<canvas.height?30:32;ctx.font=`500 ${size}px sans-serif`;const lines=[];let line='';for(const ch of [...caption.slice(0,350)]){if(ch==='\n'||ctx.measureText(line+ch).width>canvas.width-100){lines.push(line);line=ch==='\n'?'':ch}else line+=ch}if(line)lines.push(line);const shown=lines.slice(0,3),lh=size*1.5,height=shown.length*lh+32;ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,canvas.height-height-24,canvas.width,height);ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';shown.forEach((l,i)=>ctx.fillText(l,canvas.width/2,canvas.height-height-8+lh*(i+.5)));
}
