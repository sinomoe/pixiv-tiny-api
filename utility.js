'use strict';

function inArray(arr, obj) {
    let len = arr.length;
    while (len--) {
        if (arr[len] === obj)
            return true;
    }
    return false;
}
module.exports.inArray = inArray;

function dateRegExp(date) {
    return /^(\d){4}-(\d){2}-(\d){2}$/.test(date);
}
module.exports.dateRegExp = dateRegExp;