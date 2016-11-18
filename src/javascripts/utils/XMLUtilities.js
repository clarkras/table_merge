export function setS9ID(node, s9id){
    if (node){
        node.setAttribute('data-uuid', s9id);
    }
}
