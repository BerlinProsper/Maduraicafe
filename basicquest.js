

function reverseString(str){
    const newArray = str.filter(r=>r>0)
    return newArray;
}

console.log(reverseString([-2,4,23,-53,234,-53,0,23,-4,5,6,-7,8,-9,10])) // [10,8,6,5,23,234,23,4];