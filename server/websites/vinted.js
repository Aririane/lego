const fetch = require('node-fetch');
const fs = require('fs'); // Pour ecrire dans une json file 

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

module.exports.scrape = async (url, id) => {
    try {
    /*const response = await fetch(url, {
      method: 'GET',
      headers: {
        //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
        //'Accept': 'application/json, text/plain, */
        /*'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'fr',
        'Referer': 'https://www.vinted.fr/catalog?search_text=42182&time=1739021958&page=1',
        'X-CSRF-Token': '75f6c9fa-dc8e-4e52-a000-e09dd4084b3e',  // CSRF token
        'X-Anon-Id': 'd743d0dd-3af2-41fe-823a-0133d2d223b7',  // ID anonyme
        'Cookie': 'v_udt=v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=m07QvvPrM7FstiCzLtYawdgQOQF0sde8Wruvif0hEMjFqGCEvz3iRYyzWEFvGWcdLv86sqgTExK518gY_bAFaQS2mpYPeHzFGzaaRGOxKB6OtyCGtqzeuCsMXhrR9xyI; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+08+2025+14%3A46%3A59+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…kcZz5b1FgaeL5_2p3Niy1YgDppvVozhFHZvpkhRJqsu4t498P7wV0WCMODoVjPmEba85FUkskzmhe9bLKogotBBOz_LDbbF8.rkKcIgU9yWj6IuD0UnvPHQQwwO18_LCyDKklLb_2_fEJNKmtCWofxivYGndISBFawarIV5SYNx8L4Dssz8.8Sj9yZoj4KZ.2RqUrTFV2IDnBrKM3orjFIvvJwBIaBgWupLfnoEEmIIMYxijBcQIbVztQul8bHVvIDX.Yp7HBPN2Ir_q9LKmFq0J5RtsqcJPTCiPwJXDMk79EgsFxNb_66wDI2giAHB1snC4dePPEtg; __cf_bm=5Q7OgIGi13IyP88rTbsUJKggFJEOS39fsSDAHBUnDNw-1739024911-1.0.1.1-9Xgxy7SzWSofqc.LjFMGnSvI0trmlUJ2o3fIvfquZGSkuB45UaYukBuqggVdrpKh3FpU0N7YE17WhNWYhC6L.N83eWlJdTf81wcc00DRNkA; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=4Lrk7uuFAC8_KY7udN2Yp9Jl8~BxlmvPuSkEN9GUTE3oIWuW19I1uk5AIG7xc~aVY_gRT68dpQN2sJj73afWiOjSiv0zjZsPlmshSaf1LAla3fGRGDTdvqM2lKSP6ugG; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+08+2025+14%3A39%3A16+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…-ZBUSSyzdy9DSyOCPtDZnPMil8VnNRz50v92xcug6YFlKUHLcjV8m9ArJQxjqxheV2296K_chEMwTdVM4lyz894O7p6ITY5.QF5LC8mWWvaQ; cf_clearance=WKxHaTp8jzabF8JrD16n0t096WklzxAXxKFeLOg_Lcw-1739021929-1.2.1.1-wjenj8uyU78mU7IqTo__oHcMPfzDsZcl0487I9xCmm..YjepjEfZPgIC5VLcfOLrNtS1SwQ8GejOlPNdAXmgzUTq3APRLlsBnaI9T82hMU8N0W3M7Dp4b0C.OSHcQ94l5vQBQ5F_ALCeTPA3PW.ZriPcmMS5bBIzE_a3eXc17bmrBy4OFRi4Jov4NvQABzE7yHfthP8EE4HluEnWBJ9yHsdQhsAA1JDGPwWsF7ZiTsDM0kxJJYkDeWkgS2EU2bcz4TqaasF50CgO3atahmTInMCsS2Wchj1IXfxUjUsDaxY; banners_ui_state=PENDING',
        *//*
        'Accept-Encoding':'gzip, deflate, br, zstd',
        'Accept-Language' : 'fr',
        'Connection':'keep-alive',
        //'Cookie' :"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=cA630xLyidDU9vD0bqcESDkHDvxHXLK0USpTnzuRCtkkDLOp5v6dOfxxZls1~cMx_QRTIrgkeDpvM4B9zoe_JhDGcC69GPZhPUugUHFP1CCYUfTVZAYLJktk5GFCvuO1; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+13%3A58%3A42+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…R99wakEnN82_FIqAh14ueUs0dU0gZpTl5saOMOdU4lftvm604IfNqKDbN7KzcChnUQ6f.i0dA8_c8uCjJJyZxN7Q; banners_ui_state=PENDING; viewport_size=1492; cf_clearance=ZjRphf7DrQZmKuqXcUebOwt9tUKpIyVAISMj0YnCC1g-1739192067-1.2.1.1-G16GS_fNwvAIHgZeUiFoYIt.KN1R5awpeG_uPSQqDnkAAHMYyzIBqJyE.le41N.BGh7a2NZ6ZHZMXvlYxgHNbsVTK1pPzTQ.i7eKJsV1YCxirD37JPO4eosqHyYntfNSTVVUow5tQQvWV0tFQkfZRpi_l.zFulWRr6EAKptc2tZHxVuPU1hD4gzKKtmCkPg7M07Yp5vHAdSYhyNmoQtJ3Gpo329JoizME01DGau9ceCznsMYybyZpVkIU5nxKzBoZy6lFTANKxzSmzXSlqdCZjHGZ85Lxvtj4trTU0J54zg",
        'Cookie':"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=PEJj5BHE0oCKCNE~mL1INlic8vze~PNEUgsb4yOaK48yYa~c~p4A~7FqPG6HJmPgDtYCQ53EzmDqjrWHWZAVPRrjM94m08j6cuZIBq5hIY3WCMP3XhVrTy54h7pGc~MY; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+13%3A58%3A42+GMT%2B0100+(heure+normale+d%E2%80%99Europe+central…-YEHuFfybuJRo3hImltvA8SQ4XLgqvjNfEyukXDw6xOjtmc4_M8MLFg56uw8ZWzgiR94cuCsrXSOA7tUqbGO47ApcPLZg3KVXlJgo7qG2Ewg; cf_clearance=g6MPyhG2pX6xYLJ2KrV2mdLyZDwMUURyJ6RAaLVIG58-1739194516-1.2.1.1-3OTEExZKSs5OHj7ReRP2JmFJkB0BLrka_a67BVyV_7cHeuIcWdv_KyLqyVoQXFQ8uqK2fk6OqkQ0Ju2VajL63IMFyIf2WOXtOfxTgtxcLlE5PTWC3Ooi7pVQAAv16qBcgN4t5IyIOM3UozlhUfb5FPYvKEoAXSjRzbUQ0kveXpyt0nQPnVmPf5cMu3FYEL_KteGUsXJ1uuDwzi9bS6xj5W_9IS8X6f5rc_d8gI6iilENe.SLD8xANLPwqpBK7zt_2GESRjPha2Yox1zyJajKVO4iSNh9lq.JIvEYwcgrEJ0; banners_ui_state=PENDING",
        'Host':'www.vinted.fr',
        'Referer':'https://www.vinted.fr/catalog?search_text=42181&time=1739192317&brand_ids[]=89162&page=1',
        'Sec-Fetch-Dest':'empty',
        'Sec-Fetch-Mode':'cors',
        'Sec-Fetch-Site':'same-origin',
        'TE':'trailers',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
        'X-Anon-Id':'d743d0dd-3af2-41fe-823a-0133d2d223b7',
        'X-CSRF-Token':'75f6c9fa-dc8e-4e52-a000-e09dd4084b3e',
        'X-Money-Object':'true',
        
        },
    });*/

    const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=42181&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=", {
      "credentials": "include",
      "headers": {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "fr",
          "X-Money-Object": "true",
          "X-Anon-Id": "d743d0dd-3af2-41fe-823a-0133d2d223b7",
          "X-CSRF-Token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Cookie": "v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=t8mh3vxqPqKlVwA6PZcXlFPHNuXy6GGbP~Ma6ejF9PCHby2FvxMfhV4nAX69hn0GJIA4TixFce~RvYTYNkvo7J0lHNXiqfm6EQFA0WhZ9D94kIh6QjdLc7Hza5AvjTm1; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+15%3A53%3A00+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=d743d0dd-3af2-41fe-823a-0133d2d223b7&interactionCount=48&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-01-06T21:45:19.777Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTk5MTc3LCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzkyMDYzNzcsInB1cnBvc2UiOiJhY2Nlc3MifQ.NYzFfTa77GXE_Ch9vvsv9U-LX0b03u5PI0DYW8nQyOr8SaoKySkGS5o1M3N4gxb_lhXmQDvhP7T4ReRFvqeoWE1sF3o_JC6cQsNnYRzZVwUvw_OkX1kQEs1WyQNGbCHMqHf6zqEIcWunHp8tddaqS7NNb4PBLokSaOKiQPUzrPadJDF-E6OVFf-2vybx0_K3etLab-4uDAz_h_fTHEB6BBExhYrH_Fpp_b3tO22_rOdqCuXot2R6il5Hh8_nyhWePMFmDc7APRobCCw9211rSQXuPYRrZHAA77zdTqdL2SSrrkKt0FPJvggKttvDZML38b6eWBgJVekRfsAytwmNYQ; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTk5MTc3LCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk4MDM5NzcsInB1cnBvc2UiOiJyZWZyZXNoIn0.BqQ8sBSP9IalRmDRgKKquqAiQbRlQUvfBBPgAgh2CoLb22L-IsZ9bnr7UFXVO6yymq9q7FqBveOuWC47criMKhkiDFeE6PMyVY6lXPLaNrCa-y2C31pVhgnpDgA9jfvdVJ9oaze_v3k4_TufnjY6-KFtBrMsh0v3YQKwS-hhiLtBP9HY-GxHjY9hbNq58RFooSArr91nbGqmKf14eWuZeFzLzDffbhQBdnETHKXgeh4SzoRLKOJ32ZYJd6D227fr2i9RsYj2hZwfknQBW3H9Y8LVG40BnLAbHWUFbOPZwI07z8N43lBJYKESm9N-IxoYD9ZPoNpNv_u88-G9fakMuA; _vinted_fr_session=bFNzZ3JNcUc5YVpxUnFvSy9YenRHVisxRW90V0g5RkYvdjNmQ3JzQ2FhMm4yOG5ZOTFHWTBRUFpQUnlvcU1SazRkSXp5YlA4TlFBdTB3Mk1FMnNFampJU2M2aXJOU0hBZDVRVFJXSGQzTVRTSVROU0l4dnlvZHdDM1FjbHcrdkdNcGVVTmt1b3FWdkdhNGlCWXhCMlVOM0JaMk4xM3IvSml6aDdiRHZUcUY5QTJ6a3E5NGI0eHUxL2JFeUpSWE9IajJEWHkrUktOaVEyM3BmT0x4S1RndFNsdWZzakhUSmJ5eWNVUUNMUDZBd2p6R1hVdFFSVnNXNGZZZENUZStVby0tbmg5OFpXc2hsZ1ZhSG1nNkxRWHBXUT09--a7e445a770202557687019ec0817dcb876b2b4e6; viewport_size=1495; cf_clearance=g6MPyhG2pX6xYLJ2KrV2mdLyZDwMUURyJ6RAaLVIG58-1739194516-1.2.1.1-3OTEExZKSs5OHj7ReRP2JmFJkB0BLrka_a67BVyV_7cHeuIcWdv_KyLqyVoQXFQ8uqK2fk6OqkQ0Ju2VajL63IMFyIf2WOXtOfxTgtxcLlE5PTWC3Ooi7pVQAAv16qBcgN4t5IyIOM3UozlhUfb5FPYvKEoAXSjRzbUQ0kveXpyt0nQPnVmPf5cMu3FYEL_KteGUsXJ1uuDwzi9bS6xj5W_9IS8X6f5rc_d8gI6iilENe.SLD8xANLPwqpBK7zt_2GESRjPha2Yox1zyJajKVO4iSNh9lq.JIvEYwcgrEJ0; __cf_bm=U9lvZfqGnOGMOMAPZIGVq0dLGXpzAKScdr7_byeZ33Q-1739199178-1.0.1.1-xM7jcMQqQWD4s3CXdQor674fEX24Eu.MQKil4GkrCv1SNZhNuNH9jGGQtUT6F6MdiZfMm.jHTW5oZekaAy1zfVhToYvHlKWcqVzEvh0Bz1Q; banners_ui_state=PENDING"
      },
      "referrer": "https://www.vinted.fr/catalog?search_text=42181&time=1739192336&brand_ids[]=89162&page=1&status_ids[]=6&status_ids[]=1",
      "method": "GET",
      "mode": "cors"
  });

  
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Récupère la réponse JSON
    const data = await response.json();

    // Vérifie si le JSON contient des éléments à parser
    if (data && data.items) {
      const sales = parse(data);
      fs.writeFileSync(`dealsVinted${id}.json`, JSON.stringify(sales, null, 2), 'utf-8');
      console.log('Les deals ont été enregistrés dans deals.json');
      return sales ;  // Utilise la fonction `parse` pour extraire et formater les éléments
    } else {
      throw new Error('Aucun élément trouvé dans la réponse.');
    }
    } catch (error) {
        console.error(`Erreur lors du scraping de l'URL ${url}:`, error.message);
        return null;  // Retourne null en cas d'erreur
    }
};
  