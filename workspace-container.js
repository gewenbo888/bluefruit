/* EBML (RFC 8794) header-only duration repair for streaming MediaRecorder WebM.
   Only Info is rewritten. Cluster bytes, timestamps and codec data stay intact. */
function width(byte,max){for(let n=1;n<=max;n++)if(byte&(1<<(8-n)))return n;return 0}
function element(data,at,end){const iw=width(data[at],4);if(!iw||at+iw>=end)throw Error('media');let id=0;for(let i=0;i<iw;i++)id=id*256+data[at+i];const pos=at+iw,sw=width(data[pos],8);if(!sw||pos+sw>end)throw Error('media');const mask=(1<<(8-sw))-1;let size=data[pos]&mask,unknown=size===mask;for(let i=1;i<sw;i++){size=size*256+data[pos+i];unknown=unknown&&data[pos+i]===255}const body=pos+sw,finish=unknown?end:body+size;if(finish>end||finish<body)throw Error('media');return{id,start:at,body,end:finish,unknown}}
function sizeBytes(size){let n=1;while(size>=2**(7*n)-1)n++;const out=new Uint8Array(n);let value=size;for(let i=n-1;i>=0;i--){out[i]=value%256;value=Math.floor(value/256)}out[0]|=1<<(8-n);return out}
export async function withWebmDuration(blob,durationMs){
 if(!Number.isFinite(durationMs)||durationMs<=0)throw Error('recording');const data=new Uint8Array(await blob.arrayBuffer());let segment;
 for(let at=0,n=0;at<data.length&&n<8;n++){const e=element(data,at,data.length);if(e.id===0x18538067){segment=e;break}at=e.end}
 if(!segment||!segment.unknown)return blob;let info;
 for(let at=segment.body,n=0;at<segment.end&&n<64;n++){const e=element(data,at,segment.end);if(e.id===0x1549a966){info=e;break}if(e.id===0x1f43b675||e.unknown)break;at=e.end}
 if(!info)return blob;let scale=1000000;const parts=[];
 for(let at=info.body;at<info.end;){const e=element(data,at,info.end);if(e.id===0x2ad7b1){scale=0;for(let i=e.body;i<e.end;i++)scale=scale*256+data[i]}if(e.id===0x4489){const view=new DataView(data.buffer,e.body,e.end-e.body);const existing=e.end-e.body===8?view.getFloat64(0):e.end-e.body===4?view.getFloat32(0):0;if(existing>0)return blob}else if(e.id!==0xbf)parts.push(data.subarray(e.start,e.end));at=e.end}
 if(!scale)throw Error('media');const duration=new Uint8Array(11);duration.set([0x44,0x89,0x88]);new DataView(duration.buffer).setFloat64(3,durationMs*1000000/scale);parts.push(duration);const length=parts.reduce((n,p)=>n+p.length,0);return new Blob([data.subarray(0,info.start),new Uint8Array([0x15,0x49,0xa9,0x66]),sizeBytes(length),...parts,data.subarray(info.end)],{type:blob.type});
}
