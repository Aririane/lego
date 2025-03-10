const { getBestDiscountDeals, getMostCommentedDeals } = require('./queries');

async function main() {
    console.log("Meilleurs deals avec discount :");
    console.log(await getBestDiscountDeals());

    console.log("Deals les plus commentés :");
    console.log(await getMostCommentedDeals());
}

main();
