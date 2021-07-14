const words = ["aaaaa v01", "aaa v02", "bbb v03", "cccc v04", "cc v04"];
const me = "aa";
const formated = words.map((word) => word.substring(0, word.length - 5));
console.log(formated);
const index = formated.indexOf(me);
console.log(index);
console.log(words[index]);
