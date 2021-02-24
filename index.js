const scrapeIt = require('scrape-it');
const XLSX = require('xlsx');
const { transformDate, wait, allSequential, createArray } = require('./utils');

const YEAR_START = 2000;
const YEAR_END = 2020;
const DELAY = 5000;

function run() {
   const years = createArray(YEAR_START, YEAR_END);
   const promiseFns = years.map(y => () => getGames(y).then(wait(DELAY)));
   allSequential(promiseFns).then(results => createXls(results));
}

function getGames(year) {
   console.log(`Getting Games for ${year}`);
   return scrapeMetacritic()
      .then(result => result.data.games)
      .then(games =>
         games.map(g => ({ ...g, releaseDate: transformDate(g.releaseDate) }))
      );

   function scrapeMetacritic() {
      return scrapeIt(
         `https://www.metacritic.com/browse/games/score/metascore/year/pc/filtered?view=detailed&sort=desc&year_selected=${year}`,
         {
            games: {
               listItem: 'td.clamp-summary-wrap',
               data: {
                  title: 'a.title>h3',
                  releaseDate: '.clamp-details>span',
                  metascore: '.clamp-metascore .metascore_w',
                  userScore: '.clamp-userscore .metascore_w'
               }
            }
         }
      );
   }
}

function createXls(results) {
   const workbook = XLSX.utils.book_new();
   const headers = {
      title: 'Title',
      releaseDate: 'Release Date',
      metascore: 'Metascore',
      userScore: 'User Score'
   };
   results.reverse().forEach((r, index) => {
      const workSheet = XLSX.utils.json_to_sheet([headers, ...r], {
         skipHeader: true
      });
      const name = YEAR_END - index + '';
      XLSX.utils.book_append_sheet(workbook, workSheet, name);
   });
   XLSX.writeFile(workbook, 'out.xls');
   console.log(`Finished, see out.xls!`);
}

run();
