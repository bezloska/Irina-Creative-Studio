import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup(values=[0]){
 const elements=new Map();let index=0;
 function element(){return{style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},attributes:{},listeners:{},append(){},setAttribute(k,v){this.attributes[k]=v},addEventListener(k,v){this.listeners[k]=v},animate(){return{finished:Promise.resolve(),cancel(){}}}};}
 const faces=Array.from({length:6},(_,i)=>Object.assign(element(),{dataset:{number:i+1}}));
 const document={querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return faces},createElement:element};
 const context={document,Uint32Array,crypto:{getRandomValues(a){a[0]=values[index++%values.length];return a}},matchMedia:()=>({matches:false}),window:{},Math};
 vm.createContext(context);vm.runInContext(readFileSync(new URL('../main.js',import.meta.url),'utf8').replace('export function','function')+';globalThis.pick=randomFace;',context);
 return {context,elements,faces};
}
test('all six equally sized random buckets are mapped correctly',()=>{for(let i=0;i<6;i++){const {context}=setup([i]);assert.equal(context.pick(),i+1)}});
test('biased remainder values are rejected',()=>{const {context}=setup([4294967295,4294967292,5]);assert.equal(context.pick(),6)});
test('each roll matches the face, accessible label and Ukrainian result',async()=>{const expected={1:[-16,-22],2:[-106,-22],3:[-16,-112],4:[-16,68],5:[74,-22],6:[-16,158]};for(let n=1;n<=6;n++){const {elements}=setup([n-1]);const button=elements.get('#roll');const promise=button.listeners.click();assert.equal(button.disabled,true);await promise;assert.equal(button.disabled,false);assert.equal(elements.get('#cube').attributes['aria-label'],'Кубик: '+n);assert.ok(elements.get('#result').innerHTML.includes('<strong>'+n+'</strong>'));assert.equal(elements.get('#cube').style.transform,'rotateX(-22deg) rotateY(-28deg) rotateX('+(expected[n][0]+16)+'deg) rotateY('+(expected[n][1]+22)+'deg)');}});
test('frontmost geometric face matches each reported number',()=>{const normals={1:[0,0,1],2:[0,-1,0],3:[1,0,0],4:[-1,0,0],5:[0,1,0],6:[0,0,-1]};const angles={1:[-16,-22],2:[-106,-22],3:[-16,-112],4:[-16,68],5:[74,-22],6:[-16,158]};for(let n=1;n<=6;n++){const [x,y]=[angles[n][0]+16,angles[n][1]+22].map(v=>v*Math.PI/180);const depth=([a,b,c])=>{const xx=Math.cos(y)*a+Math.sin(y)*c;const zz=-Math.sin(y)*a+Math.cos(y)*c;const yy=Math.cos(x)*b-Math.sin(x)*zz;const z=Math.sin(x)*b+Math.cos(x)*zz;return Math.sin(-22*Math.PI/180)*yy+Math.cos(-22*Math.PI/180)*(-Math.sin(-28*Math.PI/180)*xx+Math.cos(-28*Math.PI/180)*z);};const visible=Object.entries(normals).sort((a,b)=>depth(b[1])-depth(a[1]))[0][0];assert.equal(Number(visible),n);}});
test('sound toggle exposes its state',()=>{const {elements}=setup();elements.get('#sound').listeners.click();assert.equal(elements.get('#sound').attributes['aria-pressed'],'false');assert.equal(elements.get('.sound-label').textContent,'Звук вимкнено');});
