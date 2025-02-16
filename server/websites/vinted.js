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
    url: item.url
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

    const response = await fetch(url, {
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
          "Cookie":"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=d3d0ac71377cb5552902882c806a76f4; datadome=b68PVtjUQwwbDErQrJePEzG8nI2w_dcWuYBhSHyaHrNbbglN2n26aoj66Tqh3EVTRhG4kt0pkONwPyimUbeOcW3fuODpWwBeiDZ_bghLFGocvEO698cv87AKuHA3lx96; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+15+2025+18%3A39%3A10+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=d743d0dd-3af2-41fe-823a-0133d2d223b7&interactionCount=58&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-01-06T21:45:19.777Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzM5NjQxMTMyLCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk2NDgzMzIsInB1cnBvc2UiOiJhY2Nlc3MifQ.b3YS6NcmlAqQVRGmSszG5C7S8QbURA44PiYmBbFobJVKrh6CvWZU5bZeysg8duG9-qVcEDFY5PrJbmlsioioy1lSYeUnRvk6yaGofoGwOPGniLCo7LZFzRK0n9165uDYkLcl5Ku_E-RQePU5BWJJnIkjahVg6-iyT-WH_fZjCVaz500vdH74aJiXkNV6GgxFBYZUTL4MjKH9cEYRSwhiglgq1hP-fZK9Ouy30JoKofQJA3jD7csQ2-GJjC3mqMEQrBqfO3h753zJLSw3LJbd3-0LdE0WqWlhMdhb9Petsy0CrsdyHEnE6Nqk85qnT_zOSNbgO8x3hEf0-prFEZlnSg; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzM5NjQxMTMyLCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDAyNDU5MzIsInB1cnBvc2UiOiJyZWZyZXNoIn0.lXzmPU9BVk2fq5vmiohr42Gc8tuPn92_ycsMHmI1mlQi58nLM6r_zF0j8pxU0k6Lb8suDjdL5Wot5HrbZ7Istzjwy1vhcoIYosvPlkF7XnmRuIdHADKAvnjNIkPoDaofn6g9feDzRaMD6cjzVSgIrq-PAhj3iwLCV0xhGNFv7vica0PY7ckUl_Dq6YWnZqtCkjCX1tbJJdtnLto0MPERj4rvgw5V1Mp4iudVIe3jiYk2Z10Xyp51s9A3Hblbb22DloXues52udmyBe2GFnNRSolXdWHEK4QR_MeeMiZWROlFnWqsn7270hFLBU5cl__v1MZfbQZaERe3hvjW8Dt4UQ; _vinted_fr_session=aEMvdDlJWFVJcEx1cTF2bU0rek9nbTAwem5VUzVmaHdER2x4SXl2UnJJNzJUd1BaMWd0VFJsV1FLSjBaMTVia01mVzBrRWp4NWZnY0dtQUlJdnpxTDdWdzVtU3lsbmkvMHhCbTdmeWhSVVE0NXdaaWFxVnVXd092dFRCU0FzWlNmdDlqRFdVSlJhdHl3c1FjbVpUKzFzRTZQbW5TWVhmekFEQldiM2cvdGd6Q2dGcExHMW1rODcxTGMvUWhyaldRM1hYa1VQaE0vZ0V1YVllMXRDU2NmOVFrdDA2OWRrWjh0TXVIQ1k3TVVFVVNKeXFsY3VwaFRveEkvdG1paTVVbS0tU0drN3l5OHBhVU9wTEo0U0NyQ3VMdz09--02833a094c51b0ba245aab38be58c27fbeead3d8; viewport_size=1536; domain_selected=true; __cf_bm=PhKXoTFsMMCy3GVm..vszClpfgJn_0LrwwMUp8gryjA-1739641132-1.0.1.1-MNr7XyqZrsOxlPyLtZT4WlNkgH.7hl4GpDgaMjLpprnR_Cxzqbrex4qYV2i336TwdPKhqsdZc.W5cKNT9IjK9OGEparTiNK4p2w.7LxTcqw; cf_clearance=UWTi46gT2jwFiPpmeeUOU4sQ6ze4hcSN.xoCyPD61BQ-1739641133-1.2.1.1-2YgyYGzRzWJKjKMfP638y3YrB_LX1vFpwe52caCBV0qO_P1ZNaLfMx3Ibc44GYd.u2jgbgz3EQ5S2UjNjo9_TDJXsQiHbOwWuxhYuAFtPcysF41QneZqmAg3mp4f9pOilNX3rxbIxrVN9W_HRtiMM97_APfRQLVad7GjaPYYpbK.9gJDpkQhVirmno2Ax5mzpoGDDrOv6iAgMzIoTgxrXHpFaHqxRIQgRUfJP7rDUddypq3wiM0LUmbuLxnOITtnE3cVodwjo9mqVtdG4YegTF4LdWDiBDcTU3Ifr3LaF8I; banners_ui_state=PENDING"

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
  