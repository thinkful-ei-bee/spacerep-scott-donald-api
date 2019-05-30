'use strict';

function buildLL(LL, head, arr) {

  
  if(!head) {
    return  LL;
  }
  else if(head.id === head.next) {
    return console.log('LOOOOOOOOOOP');
  }

  //console.log('HEAD.next', head.next);
  // console.log('arr before', arr);

  LL.insertLast(head);

  const next = arr.filter(word => word.id === head.next);
  //console.log('NEXT', next);
  // console.log('arr after', arr);

  // if (!next) return LL;

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



function size(list) {
  let size = 0;
  let currNode = list.head;

  if (list.head === null) {
    return size;
  }
  
  while (currNode !== null) {
    size++;
    currNode = currNode.next;
  }
  return size;
  
}



function isEmpty(list) {
  return list.head ? false : true;
}



function findPrevious(list, item) {
  if (!list.head) {
    return 'List is empty';
  }
  if (list.head.value === item) {
    return `${item} is head`;
  }

  let currNode = list.head;
  let prevNode = list.head;
  while ((currNode !== null) && (currNode.value !== item)) {
    prevNode = currNode;
    currNode = currNode.next;
  }
  if (currNode === null) {
    return `${item} not found`;
  }
  return prevNode.value;
  
}



function findLast(list) {
  if (!list.head) {
    return 'List is empty';
  }
  
  let currNode = list.head;
  while (currNode.next !== null) {
    currNode = currNode.next;
  }
  return currNode.value;
  
}


function revList(list) {

  if (!list.head) {
    return 'List is empty';
  }

  if (!list.head.next) {
    return list;
  }

  let currNode = list.head;
  let prevNode = null;
  let nextNode = null;

  while (currNode !== null) {
    nextNode = currNode.next;

    currNode.next = prevNode;
    prevNode = currNode;
    currNode = nextNode;
  }

  list.head = prevNode;

  return list;
}


module.exports = {buildLL, display, size, isEmpty, findPrevious, findLast, revList};




