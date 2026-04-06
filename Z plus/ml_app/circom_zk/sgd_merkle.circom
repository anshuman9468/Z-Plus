pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template MerkleVerifier(depth) {
    signal input leaf;
    signal input root;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output out;
    signal cur;
    cur <== leaf;
    for (var i=0;i<depth;i++){
        component left = Poseidon(2);
        component right = Poseidon(2);
        left.inputs[0] <== cur;
        left.inputs[1] <== pathElements[i];
        right.inputs[0] <== pathElements[i];
        right.inputs[1] <== cur;
        signal sel; sel <== pathIndices[i];
        signal left_h = left.out;
        signal right_h = right.out;
        signal cur_next;
        cur_next <== left_h * (1 - sel) + right_h * sel;
        cur <== cur_next;
    }
    out <== (cur == root);
}

template SGD_Merkle(depth) {
    signal input w0_pub;
    signal input lr_pub;
    signal input w1_pub;
    signal input merkle_root;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input x_priv;
    signal input y_priv;

    component leafHash = Poseidon(2);
    leafHash.inputs[0] <== x_priv;
    leafHash.inputs[1] <== y_priv;
    signal leaf = leafHash.out;

    component mv = MerkleVerifier(depth);
    mv.leaf <== leaf;
    mv.root <== merkle_root;
    for (var i=0;i<depth;i++){
        mv.pathElements[i] <== pathElements[i];
        mv.pathIndices[i] <== pathIndices[i];
    }
    mv.out === 1;

    signal S; S <== 1000000;
    signal S2; S2 <== S * S;
    signal S3; S3 <== S2 * S;

    signal left; left <== w1_pub * S3;
    signal termA; termA <== w0_pub * S3;
    signal termB_inner; termB_inner <== (w0_pub * x_priv) - (y_priv * S);
    signal termB; termB <== lr_pub * termB_inner * x_priv;
    signal right; right <== termA - termB;

    left === right;
}

component main = SGD_Merkle(16);
