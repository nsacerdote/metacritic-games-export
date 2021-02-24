const { parse, format } = require('date-fns');

function wait(ms) {
   return r => new Promise(resolve => setTimeout(() => resolve(r), ms));
}

function allSequential(promiseFns) {
   const initPromise = Promise.resolve([]);
   return promiseFns.reduce(_chainPromise, initPromise);

   function _chainPromise(acc, pFn) {
      return acc.then(result => pFn().then(pResult => [...result, pResult]));
   }
}

function transformDate(d) {
   return format(parse(d, 'MMMM d, yyyy', new Date()), 'dd/MM/yyyy');
}

function createArray(start, end) {
   if (start > end) {
      throw 'end should be greater than start';
   }
   return Array(end - start + 1)
      .fill(null)
      .map((_, i) => start + i);
}

module.exports.wait = wait;
module.exports.allSequential = allSequential;
module.exports.transformDate = transformDate;
module.exports.createArray = createArray;
