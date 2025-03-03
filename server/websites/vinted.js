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
            "Cookie":"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=3d6bb505-1740757479; datadome=oDVdZUgGi3DmzyvNLklr8tYLfnN1Isq6176wVpaFLmv42w73XdG7xYQYKwEPKB4L1o9R5Kpno8K94ztKAbfEAkA~UdbRlbRp6FYxSESjcs41NxgIEvbbYxuB0iIxrX6j; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+03+2025+15%3A58%3A34+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=d743d0dd-3af2-41fe-823a-0133d2d223b7&interactionCount=71&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-01-06T21:45:19.777Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDEzODI0LCJzaWQiOiIzZDZiYjUwNS0xNzQwNzU3NDc5Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDEwMjEwMjQsInB1cnBvc2UiOiJhY2Nlc3MifQ.Ljh8HGZDpLIfyMDhVpvc7jy7r89I12qg4wBpZ4lC7ieERc2t9UF75QtNVpkASvUlyDngjeIn8YFNqfJ8vzUdGr8WK0Da8U6WqXz-Ky7FiYMlUY5uuguhTfSSp70fRactBRYdVc5bK5eVqoa3C1tZbbdq5JxAAy9cH2m581N6DAAqgifsUFDc_SJIVV4DbRKs9nKXK6L9wvY-wMBca_H0NNjBb524hbAdL2lOkHTnPVydaUPUO7u4lyX9BMZiz764p0sfglI7oXSyTuIXNEhzXGQ78O3D8fRufK7CCD8JL9-jA-3B_kX171KkaF578zqtqVzR4K388eXFxDwrsl1jKw; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDEzODI0LCJzaWQiOiIzZDZiYjUwNS0xNzQwNzU3NDc5Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MTg2MjQsInB1cnBvc2UiOiJyZWZyZXNoIn0.YKCBjDfoGl9JmLTTVF5ylEKbquFuqelU6aN-mtPTx1JWLaGlOzWnQeCSkhUtL_jWvaSSV3JqdnMcnSBp-QzBBXpCnTYWfQ54AoHh1P1ozceyNWnLB3i6fBNK7E7giEUNTms0Fy4JVmsGpB_dncA3Rw0ZPpxl-_Uq_EvPXI_GuSB1qjro0oZkE92Ah-mubSupeAwDv4H8yv6LW9m-NVd-GJtwmjfTWOLkFtuIt4KcmUcO2uTTcAJ6JTDD3TON-ZAZlzD8HVNfzVg-BZhEip5ix77tBxFVDRJJGjxlEnLKQvHytmSKwDF9J3gfn8L55lAbt6-2ezPZqOVktDL3nLGN_A; v_sid=3d6bb505-1740757479; _vinted_fr_session=ejZXRTVISm5ybWhyRkpZT0w2RkdpQXNDNmxhc0NoWWhDNTB4MThaQ0d4YmlBYkNBdFB1VlFaczVhRkk1Q2dBMVFTbXRaaUxhMlRFQnBLVEQ1eVNkcm5renVBNGg1ZGhFbEhoa0ovaVA5dDEzOEtGTUxsRU1pR25rQ3hSZ1FKK0dsaGVjbVJ0dG9LZHJYaU9xY29qOU8wYnhwQXA5SVk3SWRYZGRNaEZMSWtwL3JzeGF2aG1lU05EYVdGRGYxZDZPZ2N3OFFFdHhLZHNFRnhCWG8weGhYZWFoVlZYTXJlSWJNNXgrUmhJRDU3SlRSYkZMQnJWSE5ibi9MV1hydFkxK3B6eXg3RWNEZFFHcmVqUndkQUlleU1QT1REQThYYy9EQlFRaGVaZEI0TVJYTVZDbXlQM3NpekZCR0lQcE91K2NBZnJjUks2ZlB0M0UrNkJ4MXVxbk5ONXJTRVhHZ1htOGdaMVEzQ3lzMGluOGhPK21WUEFtd0QrN0F5K05oWlMyZEZsR3AwR3V5a1puM0N4blE2bWxTSFFRb1VSamh0WHFUMEJjdEZYK1pydml0WWovb2ljSUs1RUNyL3MwL05aOGpUQ1VhQ1pEdDhNQ1JIVmZuc1BMbEVCSU1JL25FeGZTWWtFTS9qYXVVMjV0SEo3VnhHSEhKcVAvbzdiU0c3VGJKZmlmL25ieU84cWN5K3lWTGR5NVdEU2U3VnpFRXA4OTF1eU5vWjlhZDBlUDZ3aGlTQTE5MjE3SGV3WWtLVUtGNTlydFRlMGpOYVNzS2pEOFNFUkNDZGluNG56NFROQ0VIQTd4bURHSitreG5menROYUQzVk9tRWhjY2JNVE54dE1LVWtkODQ5ZU1haldFdzBNN3JsRTQ4UXpla2d5bktYdzFJZWhUMjFNMGJCSFJZMFJranQzTmY2RmFGandMWDJZSFhYVjRROWxQN2NxVldpT2NQSXBiMUJzOTYvRnU3VHBZdWtaRXJQOXJHcWN1NjN2Qnc3ODVndi9DaU9idkdrbkI5dGhRWEFJcVhUVm0vQVRPeUVhNHY2Wk9wNFEwU1pIZStxMGQ2UWtyMVBCSnNQVndLd3pVaHNqMDdzRVFzd0xaYU95WVpYaTA4OWdKSkxFRHBnNkZZTUFabFEwekU4cVpRR3Zrc2pZTE0wbWY5VUZvVktaTXZPVEtYTDMvU2JiSDZLWjhhbk5lc0FtTVk3N2pkMUpxSjcvZ1QvYnpMUHdpN2h6WnJ2LzAvenBCeloxQjc5dmtKRDZHTTV0RWx5eHpRVjl3WlVzUklxWFd2ZUF3UWEvcVVRMEZscUhQQ2FHekhLa09mYWpTVml0SU04SGlVTE8zTWFmNytuZXphNVRyUVZ2WDhiUU5NUkFZbGFQRmlqR1Z4Q2xUNW1rR0lURWszUWgrTGlJYldodUU3VHhibDFSeitmNTE0b0Z6Rm5UdmVFbU9nSXlMZ1U4REpnNDVKMDMrY0pWYzdwbUdiaU9mVE11TGFWQUNLZ1RuanFjcThPaGtqYy9nRDNKWG03YzNvd2tYdDQ0RndIRGlnSEVzenBWVWowRU1VaDhqVExOVlR5MlNKZytBQXUxMVYwSC9MTzRPalRGa2huNGwrTmtFVGlZZmxKdzQ0REYxOUllMUIrdkdwQU1JZmwwbG1SaEoxZ3NySnNaM0w1anp0Zmppekd3Si90eEF6WGR3RW5Tc0pUcDM0QllqdDNTNEg5MEJaakhodlNnVlNraUJLU01tQ0xUakU2eUxYTmFiL0ZtMmNEa2krN3ZCUU8rWGhBUHM2RFVnZFd6ZGdUT0NaRlh2cFVuSTRiZi9UYUdra3NmMXFiZlozVTBiWCtmdHBWV0swTzRyUkFaaklnc0YyZDVrSHNOM0FtWUpXeTkvQnA5TzV4dFN0aEJNQ3N1U3N5bDRCMkZtT1BUOU9pa24wOWxsQ2Z2QXJXdkIwOTU0QVdmZU1oOTVSL2Z2Z0Y5OFBHVytLemtleUJ6MzROVWZzbnZ2aHhkRW5lNlBFOHArcUVhY2V0eUs2WThoVmN4bGlGd1hUeE5qd25la0F6TVBkdGhrdXdsa2llMmJEUFVZVHFDelRUK1crR3VGSXR3K05CQ1k3Y2FkWGdsWDE2d295ekY2UlRVdEZBWmJHbkNjNktIaXZkU2VLUzdETGV0WFg0NU5NcUNEdlpJREYvRXdTWjZ6NnRtL3ZNbmhOTGdWSXAxbXZST0ZmdHpZL2NqQXViUzBwa2VXSU1uUjErbUN6MlRQRnI2MFBaVXBER1NhaXNJTUxjdkF5TERxY3ZTaXQ5WFEyaE9KRHUxbTlNeXE0YUVzSm5YcWVrN1hpaEtwcGxVUU81TFFxenoxQUZMSEJtdXorRW8rd1Q2ejNDQVR0MS0tTkJLeFgwdUZmTmZMMUtmT21nam5vUT09--114d2fe3c0aef7d0f2911b7f767a10fed3b498c6; __cf_bm=xJ.FnMN4Zd0wbdEIRHnskUClSpxCbvSuBKszyzi5qlg-1741013823-1.0.1.1-FXZAQBWZ9AK3pxUsh5tyOl3qLH_0jPrba26cRDJL9piZ5haBzxZ2B.kORqpo0jvLPt.TRYpJVYtMR3ZPJdBaJnf2nn3envx.FZvMeaNRY_YIOJswF0a4VUiwQlPLIQNJ; cf_clearance=WhTAL3PqPRUBa.iNKU7Zap31onRvE8Y77TVqcfLUcQY-1741013824-1.2.1.1-Se_i7_FPqITopJCgKDFtEYwQQRmSUOQCkY4T5lhS.CRvu8aCNnguJI2kiTGgfmVQnmgUTd8R1zdQ7ScWPzAaiNNhIuB8NyS51F6KZWR3FzGiM9..tYwrlsPSD3.4jv6R8NLFE9o2fd7HRvYNr3_gLF0bmPy0rrQYh8zwnL7h70jyHcExXYpLM.xmvADJ1yK1OdygaFjZ0fFqM5UrlnBzGUU5.O5HeOsVd_IiKL2PjDXwlucYS5EL9m2d3_O8A2_pCkTfgJJ0CkHs1KUYQbCzbdey1.UKn2aK7.fJs0CmaKTnejWvvYAjkS9SolwvOjmwcK7WmWvsw_br__Ff.w1PqNxVNiCnGtI.q00x.XPM5wTiIUkmS2nSsbRf8eQV6dLcjrG7vPiadZ30HmYCScFMxiYwzj81rh.pu.9QIeNVKl4; banners_ui_state=PENDING;"
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
  