'use strict';

function buildLL(LL, head, arr) {

  if(!head) {
    return  LL;
  }

  LL.insertLast(head);

  const next = arr.filter(word => word.id === head.next);

  buildLL(LL, next[0], arr);
}


function display(list) {
  const disList = [];
  let currNode = list.head;

  if (list.head === null) {
    return 'List is empty';
  }
  
  while (currNode !== null) {
    disList.push(currNode.value);
    currNode = currNode.next;
  }
  return disList;
}

module.exports = {buildLL, display};




