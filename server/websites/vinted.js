const fetch = require('node-fetch');

/**
 * Parse JSON response from Vinted API
 * @param  {Object[]} data - JSON response containing items
 * @return {Object[]} items - Extracted items with id, title, price, brand, and timestamp
 */
const parse = (data) => {
  return data.items.map((item) => ({
    id: item.id,
    title: item.title,
    timestamp: item.photo?.high_resolution?.timestamp || Date.now(), // timestamp, ou date actuelle si non disponible
    price: item.price?.amount ? parseFloat(item.price.amount) : null,  // Le prix
    brand: item.brand_title || "Unknown",  // La marque
  }));
};

/**
 * Scrape une page donnée
 * @param {String} url - URL à scraper
 * @returns {Promise<Object[]>} - Liste des éléments extraits
 */

module.exports.scrape = async (url) => {
    try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
        //'Accept': 'application/json, text/plain, */*',
        /*'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'fr',
        'Referer': 'https://www.vinted.fr/catalog?search_text=42182&time=1739021958&page=1',
        'X-CSRF-Token': '75f6c9fa-dc8e-4e52-a000-e09dd4084b3e',  // CSRF token
        'X-Anon-Id': 'd743d0dd-3af2-41fe-823a-0133d2d223b7',  // ID anonyme
        'Cookie': 'v_udt=v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=m07QvvPrM7FstiCzLtYawdgQOQF0sde8Wruvif0hEMjFqGCEvz3iRYyzWEFvGWcdLv86sqgTExK518gY_bAFaQS2mpYPeHzFGzaaRGOxKB6OtyCGtqzeuCsMXhrR9xyI; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+08+2025+14%3A46%3A59+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…kcZz5b1FgaeL5_2p3Niy1YgDppvVozhFHZvpkhRJqsu4t498P7wV0WCMODoVjPmEba85FUkskzmhe9bLKogotBBOz_LDbbF8.rkKcIgU9yWj6IuD0UnvPHQQwwO18_LCyDKklLb_2_fEJNKmtCWofxivYGndISBFawarIV5SYNx8L4Dssz8.8Sj9yZoj4KZ.2RqUrTFV2IDnBrKM3orjFIvvJwBIaBgWupLfnoEEmIIMYxijBcQIbVztQul8bHVvIDX.Yp7HBPN2Ir_q9LKmFq0J5RtsqcJPTCiPwJXDMk79EgsFxNb_66wDI2giAHB1snC4dePPEtg; __cf_bm=5Q7OgIGi13IyP88rTbsUJKggFJEOS39fsSDAHBUnDNw-1739024911-1.0.1.1-9Xgxy7SzWSofqc.LjFMGnSvI0trmlUJ2o3fIvfquZGSkuB45UaYukBuqggVdrpKh3FpU0N7YE17WhNWYhC6L.N83eWlJdTf81wcc00DRNkA; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=4Lrk7uuFAC8_KY7udN2Yp9Jl8~BxlmvPuSkEN9GUTE3oIWuW19I1uk5AIG7xc~aVY_gRT68dpQN2sJj73afWiOjSiv0zjZsPlmshSaf1LAla3fGRGDTdvqM2lKSP6ugG; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+08+2025+14%3A39%3A16+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…-ZBUSSyzdy9DSyOCPtDZnPMil8VnNRz50v92xcug6YFlKUHLcjV8m9ArJQxjqxheV2296K_chEMwTdVM4lyz894O7p6ITY5.QF5LC8mWWvaQ; cf_clearance=WKxHaTp8jzabF8JrD16n0t096WklzxAXxKFeLOg_Lcw-1739021929-1.2.1.1-wjenj8uyU78mU7IqTo__oHcMPfzDsZcl0487I9xCmm..YjepjEfZPgIC5VLcfOLrNtS1SwQ8GejOlPNdAXmgzUTq3APRLlsBnaI9T82hMU8N0W3M7Dp4b0C.OSHcQ94l5vQBQ5F_ALCeTPA3PW.ZriPcmMS5bBIzE_a3eXc17bmrBy4OFRi4Jov4NvQABzE7yHfthP8EE4HluEnWBJ9yHsdQhsAA1JDGPwWsF7ZiTsDM0kxJJYkDeWkgS2EU2bcz4TqaasF50CgO3atahmTInMCsS2Wchj1IXfxUjUsDaxY; banners_ui_state=PENDING',
        */
        'Accept' :'application/json, text/plain, */*',
        'Accept-Encoding':'gzip, deflate, br, zstd',
        'Accept-Language' : 'fr',
        'Connection':'keep-alive',
        'Cookie' :'v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=m07QvvPrM7FstiCzLtYawdgQOQF0sde8Wruvif0hEMjFqGCEvz3iRYyzWEFvGWcdLv86sqgTExK518gY_bAFaQS2mpYPeHzFGzaaRGOxKB6OtyCGtqzeuCsMXhrR9xyI; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+08+2025+14%3A46%3A59+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…kcZz5b1FgaeL5_2p3Niy1YgDppvVozhFHZvpkhRJqsu4t498P7wV0WCMODoVjPmEba85FUkskzmhe9bLKogotBBOz_LDbbF8.rkKcIgU9yWj6IuD0UnvPHQQwwO18_LCyDKklLb_2_fEJNKmtCWofxivYGndISBFawarIV5SYNx8L4Dssz8.8Sj9yZoj4KZ.2RqUrTFV2IDnBrKM3orjFIvvJwBIaBgWupLfnoEEmIIMYxijBcQIbVztQul8bHVvIDX.Yp7HBPN2Ir_q9LKmFq0J5RtsqcJPTCiPwJXDMk79EgsFxNb_66wDI2giAHB1snC4dePPEtg; __cf_bm=5Q7OgIGi13IyP88rTbsUJKggFJEOS39fsSDAHBUnDNw-1739024911-1.0.1.1-9Xgxy7SzWSofqc.LjFMGnSvI0trmlUJ2o3fIvfquZGSkuB45UaYukBuqggVdrpKh3FpU0N7YE17WhNWYhC6L.N83eWlJdTf81wcc00DRNkA',
        'Host':'www.vinted.fr',
        'Referer':'https://www.vinted.fr/catalog?search_text=42182&time=1739022422&page=1',
        'Sec-Fetch-Dest':'empty',
        'Sec-Fetch-Mode':'cors',
        'Sec-Fetch-Site':'same-origin',
        'TE':'trailers',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
        'X-Anon-Id':'d743d0dd-3af2-41fe-823a-0133d2d223b7',
        'X-CSRF-Token':'75f6c9fa-dc8e-4e52-a000-e09dd4084b3e',
        'X-Money-Object':true,
        
        },
    });
  
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Récupère la réponse JSON
    const data = await response.json();

    // Vérifie si le JSON contient des éléments à parser
    if (data && data.items) {
      return parse(data);  // Utilise la fonction `parse` pour extraire et formater les éléments
    } else {
      throw new Error('Aucun élément trouvé dans la réponse.');
    }
    } catch (error) {
        console.error(`Erreur lors du scraping de l'URL ${url}:`, error.message);
        return null;  // Retourne null en cas d'erreur
    }
};
  