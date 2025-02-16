const fetch = require('node-fetch');
const fs = require('fs'); // Pour ecrire dans une json file 

/**
 * Parse JSON response from Vinted API
 * @param  {Object[]} data - JSON response containing items
 * @return {Object[]} items - Extracted items with id, title, price, brand, url and timestamp
 */
const parse = (data) => {
  return data.items.map((item) => ({
    id: item.id,
    title: item.title,
    timestamp: item.photo?.high_resolution?.timestamp || Date.now(),
    price: item.price?.amount ? parseFloat(item.price.amount) : null,
    brand: item.brand_title || "Unknown",  
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
      // change cookie each 2/3 days
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
            "Cookie":"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=1291d53a-1737915783; datadome=veAUKen9llOz7vNDOssyOlnOW1GCXbXCFekUWYJedz~AZJws9ZwEyzy_1kkJAPB3QuaJqN0FEi5sdkQlK75t~vraB6_rtqvwNEed3XJkJvO_xnU9KjpEcbJTjBkMZsfk; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Feb+15+2025+18%3A45%3A50+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=d743d0dd-3af2-41fe-823a-0133d2d223b7&interactionCount=59&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-01-06T21:45:19.777Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzM5Njk2MjE2LCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk3MDM0MTYsInB1cnBvc2UiOiJhY2Nlc3MifQ.Ql_DlkRc-uf0Q_qRx_wAG4V5DUBvbphA_wKZobrgTPtbXBjAwEGpVZDcAOT3ThomzgtYaWR-AFxXDdNNEdLMamKx5dS1r3KJ5Fl3rhcX218IMT8gxwgqop5WTYAt88IBwJoy38nxO5sDgQ26ZbcdZLQzEE4RtEId_I87HlyW9szwlHXYuZKNBu1E3CNEJbK9irhSeotzB93XxczCDpl5jhUsDIsVlVgv51iz4w5fa0OJpAs1TO0Of3rnkJDCsV-Ix2g_7wnpOjvaEmIgIvFOnlNtnyKK-0_PGjMpA8gODHunwIAzZZWdasM1LseEQLD2N0W4LVSwdMjUT4D6PAZzjg; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzM5Njk2MjE2LCJzaWQiOiIxMjkxZDUzYS0xNzM3OTE1NzgzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDAzMDEwMTYsInB1cnBvc2UiOiJyZWZyZXNoIn0.kgk1e-fbjSCKXsTHvlXLZr1TgErMWa1h0_eRw1ufGeyxzEDCmHAQq0nZtjAA_ueM1a0wSbvKycOT_JbWuMXd_X5I72LE6KpRICQPnIy0rgMmJ8r00_zRm-Gvih7PUOvLTBvP2Py2nGeSf1lv-CiYfDPWOPaLvtgw2VmFy9o6CB-p8O4aPmhPglVA8V5YxMWwkkEv7bIx35mIVE8VXKdMzxVfqTD9YcWbWupCAMbccQZp4r7I_vesOzT_H72hUcee-jVyL1TyemY6LoBXMBw-UQEjEUYrkC6VPH04t0-oQfLMIMJbPyLwo00jLKQeXkPg6l8UkSGCgTG-4nLvVZnDrw; _vinted_fr_session=cU5NZndOcTZwTXAzbTBvdkdRdkJOV3hrWWNCeVUvSHZSN3VJaENiRVBmZmFZZWVOR01qNHpoUzEwblYyeDlBVzgybjBYeERpZTBBQWFNZzY4WHJzZDVLTlJkdFJhVGNEb25NRURyR0Z3bEdkUWlseE9RSU05am1VZTFxa0VLR3J2cmdOMXh6aksvTXEyby9Za0c2bC9YUUZFQnV4blNQY1FEQndMdStDcGgyRmJuTS8xbVhBMTJWS2ZBaThDUUNQL2tVN2xMdVVDcDJuaW8zVGdJY0c4RDExYUlrbDRLYlpNQXBzazVJYTBRMjF4Qkp1Z2k4emZoTzJRTVdDcGQweVpxYUxxa25XQklKVjRRRWJRNnMzU1BKekJQWDJEMmVtcmJuUkZwd3RMWVdERXVCVXlYNVdRYkFrNjZzRVByT3l6VkxqZzJ6QWhWWG00NlhFRWl2S3N6WThBdEVZMS91dU9WQWZPVzN1a2lRRDdEcVFKOGdYYzN4R1puVlMySlExUGh3SHlPNGlpeXcvZ0hiYy9JSHlIcmNpSkQrL2hkZHhUTXZFV2ZZN0czSTZvSUV2bVNQazhjSlFVSHkydXl2ekViNjAwcnNGRWRkbXVONTBMTlZ2U2IyS2o0NDFpdW5ZQk1MNHR4SE42eWN5Uk5Nczlid2I2U0ZmaE8xcW9OMlJKbzFHMVN3S1ZpeURKSElPTXVNTE9DSEVUYklSU0JVOUxWN21SclNTSG52MVBNNmRrd0xVeVFJMTlkaXNxWk9TRHErUnR1b0t3b2JLK3hTNm1TalR1dzVZMHJVaUFuUGQ0bE11UXYvMjRvcDJCUUFTWVNMRmhUSjB6RkVoVThVVkNQams4UXVFSExibS81Tk03cFJkWExJaHNCZWM5TWR0TlRJRWZBNzZCdTRMM0VldHpYWDdWekFkR1N3QWx2T1JEOUN4RXR1WS8wc1p0czRBaTZJQ2NMQ3FhWEg4V3ZWUitwdDQwNy9tRHJiejBLOTQyZjFkMkxKNFFsaks0NnhtNGhjV3A1SVZxVmFCYjNCbTE2TUdidFhjWTZSYkNJYWNnRVpuZkNYemxmYktvc0FVemE5aXhrMHphMnRIUzNuRHRYTzF1SmxDcWdjZmk5S05pd3FxcEJiSVYxTnZndXZoQ0pkWmhBMllkRXF5eFYvQmVnMG1aTmxaaDFMQU9wTkZKcDFBZmMyVjhTRlQ4ekNBaVRQeXhPT0Q2NVhpRWk2SldUc1ltU2h0LzA0dmdDZE9HcDZEbW0yNC94K2c2U3lWZkp3RG1sTUVNU0k5QzBrVFNZQXc4aFZRVUxIV1J6dm5iQW5tTTRQU0tIaXNHY0NrMFJPL0lLUkVWa1BNWXFsdW9ncjlDdkovajZnR1RYSHFJTkFQaW9zWVhNcHJRV3VtMTJDckN2ZURaR3hOd0tCVkpDQ0lRbmoxTnM0RDhqa05JeEk0Nk84eS9BaVlDOTFxUXArNGVYU3liYnBTcCsyOGUyV3ZwSEt5OVlYdEx0SUd1c0xTTjZkTlU1NGlwblVrdlljMnVvU0tmQ3dMWFBuN0s5WHN0eTJINWRobjNVVEJlaXJrYktoajg5UTNhcysxdGVGeERCazBBQ2R6V0JDS3dLb2E1ekY1aE80V0JWSWQ0NXBSc1cra1Yrazd2SDJVNHFuU1g5OGtCZ0ErdE1UYWZ3OWZPMGRhTi94SFZFaC9LT3NGYkRyQ1pta0ZZVitKWGNiaWYxcEkrUjJnalFvYUIrQld0TWtPcWZsRDU2elFSTlp0MnpEbXpmckNjR1laSHZka0RvRjdsaFZGajFFYm9NZXFTQ1JoOWhhc0V2V1BJLzBSMGthbUV5OERFalNjVU5JSDVSdy8xYXI5QXlJODQrNUEyTzQvTStPTFF3ZzZpdUtYS0Q3TmdncGNRcnp0anRDRW5ybHdrYXZ1U1JkQUdRSnUzdFVuWGs5L1B3bTVxa0ladWJJbDlReFF1RXE4TlVrNmNVYm0zbWhCdWgzSm0vSDdnYkdpNEFRbjhXekxTTDh1MkdUMUpqcGFSUEFrUmlBdmdYRW50WnN0UC9GVXFYUWNSWVZxQ044U0FxKzBOOHZrMWJRVGpLUE83bXg0OHgxZnJ6Vi9ScVdaYTNzdEhySVBNVDVJVENvdzh0c2RWQ1pBMlFCSTZ6Qjd6bHBzMXQ3UTNOK000dngycmtuRG8ybjU3WExPVXRNSC9nNnpkSUVWalpRcWRtblZLQUo4LzdJUlBiem5xVURhOUZreHUzUnZXOHNUanY4Y01Nb0hlRGV2YnZTMjZrOGs2ODNVR05HUTBsV21CejBPenk5QmZpd3VMNkwwbnFEeVlONjMwcFc0VzlFTmpwdU1rekF4d3M2TUpiSmMwaURsdEphRS0tRmtROTFWVks4WjRIUlZ0a0lyMklHUT09--12cb65a0d1ad3b91ff0e462789e1e6ef4d0b7f44; viewport_size=1536; domain_selected=true; __cf_bm=YZ1rsp0Av9IFziKJnBVeF00lqPKacsw1jY_LBEq6owM-1739696216-1.0.1.1-GEnnKvmxyXrHzzjAoKIu3Y30Rgap9VU4.FFz_x5xfmfifHE8U1s53NkKmAEbeeDPYzFeN0N3MWOQrSs0nOtSyIGbPqiUKvfs8AffRE.nLZI; banners_ui_state=PENDING;"
          },
        "referrer": "https://www.vinted.fr/catalog?search_text=42181&time=1739192336&brand_ids[]=89162&page=1&status_ids[]=6&status_ids[]=1",
        "method": "GET",
        "mode": "cors"
    });

  
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Take data (json) -> response 
    const data = await response.json();

    // Verify if JSON has elements to parse 
    if (data && data.items) {
      const sales = parse(data);
      fs.writeFileSync(`dealsVinted${id}.json`, JSON.stringify(sales, null, 2), 'utf-8');
      console.log('Les deals ont été enregistrés dans deals.json');
      return sales ;  // Use `parse` to extract and re-format elements
    } else {
      throw new Error('Aucun élément trouvé dans la réponse.');
    }
    } catch (error) {
        console.error(`Erreur lors du scraping de l'URL ${url}:`, error.message);
        return null;  // Return null if an error occurs 
    }
};
  