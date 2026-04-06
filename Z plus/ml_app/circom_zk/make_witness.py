import json, subprocess, shutil
from pathlib import Path
BASE = Path(__file__).resolve().parent
BUILD = BASE / 'build'
BUILD.mkdir(exist_ok=True)
SCALE = 10**6
MAX_DEPTH = 16

def to_fixed(f): return int(round(f*SCALE))
def from_fixed(i): return i/SCALE

def find_command(cmd):
    """Find command in PATH or local node_modules"""
    # Check if command exists in PATH
    if shutil.which(cmd):
        return cmd
    # Check local node_modules in Z plus directory
    local_cmd = BASE.parent.parent / 'node_modules' / '.bin' / cmd
    if local_cmd.exists():
        return str(local_cmd)
    # Check if we can use npx (which will use local or global)
    try:
        result = subprocess.run(['npx', '--version'], capture_output=True, timeout=2)
        if result.returncode == 0:
            return f'npx {cmd}'
    except:
        pass
    # Fallback: raise error with helpful message
    raise FileNotFoundError(
        f"'{cmd}' not found. Please install it:\n"
        f"  npm install -g {cmd}\n"
        f"  or\n"
        f"  cd '{BASE.parent.parent}' && npm install {cmd}"
    )

def make_samples_json_from_df(df, out_json):
    samples = [{'x': float(r['x']), 'y': float(r['y'])} for _, r in df.iterrows()]
    with open(out_json, 'w') as f: json.dump({'samples': samples}, f)

def run_node_merkle(samples_json, out_json):
    subprocess.run(['node', 'compute_merkle.js', str(samples_json), str(out_json)], cwd=str(BASE), check=True)
    return json.load(open(out_json))

def compile_circuit():
    circom_cmd = find_command('circom')
    if circom_cmd.startswith('npx'):
        cmd = circom_cmd.split() + [str(BASE / 'sgd_merkle.circom'), '--r1cs', '--wasm', '--sym', '-o', str(BUILD)]
    else:
        cmd = [circom_cmd, str(BASE / 'sgd_merkle.circom'), '--r1cs', '--wasm', '--sym', '-o', str(BUILD)]
    # Run from the parent directory so node_modules can be found
    cwd = BASE.parent.parent  # Z plus directory
    subprocess.run(cmd, check=True, cwd=str(cwd))

def compute_witness_and_prove(samples_json, merkle_json, df):
    merkle = json.load(open(merkle_json))
    samples = json.load(open(samples_json))['samples']
    idx = 0
    tree = merkle['tree']
    path=[]; pathIdx=[]
    pos=idx
    for level in tree[:-1]:
        sibling = level[pos ^ 1]
        path.append(sibling)
        pathIdx.append(pos & 1)
        pos//=2
    while len(path)<MAX_DEPTH:
        path.append('0'); pathIdx.append(0)
    w0 = 0
    x_int = to_fixed(samples[idx]['x'])
    y_int = to_fixed(samples[idx]['y'])
    lr = to_fixed(0.01)
    pred = (w0 * x_int) // SCALE
    error = pred - y_int
    grad = (error * x_int) // SCALE
    lr_grad = (lr * grad) // SCALE
    w1 = w0 - lr_grad
    inputs = {'w0_pub': str(w0), 'lr_pub': str(lr), 'w1_pub': str(w1), 'merkle_root': str(merkle['root'])}
    for i in range(MAX_DEPTH):
        inputs[f'pathElements[{i}]'] = str(path[i])
        inputs[f'pathIndices[{i}]'] = str(pathIdx[i])
    inputs['x_priv'] = str(x_int); inputs['y_priv'] = str(y_int)
    in_file = BUILD / 'input.json'
    with open(in_file,'w') as f: json.dump(inputs,f)
    snarkjs_cmd = find_command('snarkjs')
    snarkjs_base = snarkjs_cmd.split() if snarkjs_cmd.startswith('npx') else [snarkjs_cmd]
    
    wasm = BUILD / 'sgd_merkle_js' / 'sgd_merkle.wasm'
    wtns = BUILD / 'witness.wtns'
    subprocess.run(snarkjs_base + ['wtns','calculate', str(wasm), str(in_file), str(wtns)], check=True)
    ptau = BUILD / 'pot12_final.ptau'
    if not ptau.exists():
        subprocess.run(snarkjs_base + ['powersoftau','new','bn128','12', str(BUILD / 'pot12_0000.ptau'), '-v'], check=True)
        subprocess.run(snarkjs_base + ['powersoftau','contribute', str(BUILD / 'pot12_0000.ptau'), str(ptau), '--name','first','-v'], check=True)
    r1cs = BUILD / 'sgd_merkle.r1cs'
    zkey = BUILD / 'circuit_final.zkey'
    vkey = BUILD / 'verification_key.json'
    proof = BUILD / 'proof.json'
    public = BUILD / 'public.json'
    subprocess.run(snarkjs_base + ['groth16','setup', str(r1cs), str(ptau), str(zkey)], check=True)
    subprocess.run(snarkjs_base + ['zkey','export','verificationkey', str(zkey), str(vkey)], check=True)
    subprocess.run(snarkjs_base + ['groth16','prove', str(zkey), str(wtns), str(proof), str(public)], check=True)
    subprocess.run(snarkjs_base + ['groth16','verify', str(vkey), str(public), str(proof)], check=True)
    return str(proof), str(public), merkle['root']

def make_proof_for_csv(df, job_id=None):
    samples_json = BUILD / 'samples.json'
    merkle_json = BUILD / 'merkle.json'
    make_samples_json_from_df(df, samples_json)
    run_node_merkle(samples_json, merkle_json)
    compile_circuit()
    proof, public, root = compute_witness_and_prove(samples_json, merkle_json, df)
    return proof, public, root
