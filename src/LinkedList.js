'use strict';


class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    }
    else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertBefore(item, key) {

    if (this.head.value === key) {
      this.insertFirst(item);
    }
    else {
      let currNode = this.head;
      let prevNode = this.head;
  
      while ((currNode !== null) && (currNode.value !== key)) {
        prevNode = currNode;
        currNode = currNode.next;
      }
      if (currNode === null) {
        console.log('Key not found');
        return;
      }
  
      prevNode.next = new _Node(item, currNode);
    }
  }

  insertAfter(item, key) {
    let currNode = this.head;
  
    while ((currNode !== null) && (currNode.value !== key)) {
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Key not found');
      return;
    }
  
    currNode.next = new _Node(item, currNode.next);
  }

  insertAt(item, position) {

    if (position === 0) {
      this.insertFirst(item);
    }
    else {
      let currNode = this.head;
      let prevNode = this.head;
      let currPos = 0;

      while ((currNode !== null) && (currPos !== position)) {
        prevNode = currNode;
        currNode = currNode.next;
        currPos++;
      } 
      if (currNode === null) {
        console.log('Position not found');
        return;
      }
      prevNode.next = new _Node(item, currNode);
    }
  }

  find(item) {
    //start at head
    let currNode = this.head;
    //if list is empty
    if (!this.head) {
      return null;
    }
    //check for item
    while (currNode.value !== item) {
      //return null if end is reached and no item found
      if (currNode.next === null) {
        return null;
      }
      else {
        //else, keep looking
        currNode = currNode.next;
      }
    }
    //return found item
    return currNode;
  }

  remove(item) {
    //if list empty
    if (!this.head) {
      return null;
    }
    //if node to be removed is head, make next node head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    //start at head
    let currNode = this.head;
    //keep track of previous
    let previousNode = this.head;

    while ((currNode !== null) && (currNode.value !== item)) {
      //save previous node
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }


  list() {
    if (!this.head) {
      return null;
    }

    let currNode = this.head;
    while (currNode !== null) {
      console.log(currNode.value);
      currNode = currNode.next;
    }
  }


  
}

module.exports = {LinkedList};



