const fs = require('fs');
const circomlibjs = require('circomlibjs');

async function main(){
  const args = process.argv.slice(2);
  if(args.length<2){ console.error('usage: node compute_merkle.js in.json out.json'); process.exit(1); }
  const inpath = args[0], outpath = args[1];
  const data = JSON.parse(fs.readFileSync(inpath));
  const samples = data.samples;
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;
  function toFixed(f){ return BigInt(Math.round(f*1e6)); }
  function ph(a,b){ const res = poseidon([BigInt(a), BigInt(b)]); return F.toString(res); }
  const leaves = samples.map(s => ph(toFixed(s.x), toFixed(s.y)));
  function buildTree(leaves){
    let nodes = leaves.slice();
    const tree=[nodes.slice()];
    while(nodes.length>1){
      if(nodes.length%2===1) nodes.push(nodes[nodes.length-1]);
      const next=[];
      for(let i=0;i<nodes.length;i+=2){
        next.push(ph(nodes[i], nodes[i+1]));
      }
      tree.push(next.slice());
      nodes = next;
    }
    return tree;
  }
  const tree = buildTree(leaves);
  const root = tree[tree.length-1][0];
  fs.writeFileSync(outpath, JSON.stringify({root, leaves, tree}, null,2));
  console.log('wrote', outpath);
}
main();
