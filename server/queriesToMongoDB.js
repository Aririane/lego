const { getBestDiscountDeals, getMostCommentedDeals, getDealsSortedByPrice,getDealsSortedByDate,getSalesByLegoSetId,getRecentSales} = require('./queries');
// STEP 5: run Mongo db querries 
async function main() {
    /*// Fonctionne mais aucun supperieur  a 50 %
    console.log('Meilleurs deals avec discount :',await getBestDiscountDeals());

    // Fonctionne
    console.log("Deals les plus commentés :");
    console.log(await getMostCommentedDeals());*/

    // focntionne mais verifier les prices nuls
    //console.log('Deals classé par meilleur prix :',await getDealsSortedByPrice());

    // focntionne 
    //console.log('Deals classé par date :',await getDealsSortedByDate());

    // fonctionne 
    //console.log('Get sales by id :',await getSalesByLegoSetId(42171));

    console.log('Get recent sales (<3weeks) :',await getRecentSales());

    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: requête trop longue !")), 5000) // Timeout de 5s
    );


}

main();
