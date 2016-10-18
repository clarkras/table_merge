export function getParent(element, selector){
    if (!element || !element.parentNode) return undefined;

    element = element.parentNode;
    while (element && element.matches){
        if (element.matches(selector)) return element;
        element = element.parentNode;
    }

    return undefined;
}


export function isWhitespaceNode(node){
    if (!node || node.nodeType !== Node.TEXT_NODE){
        return false;
    }
    return /^\s+$/g.test(node.nodeValue);
}
