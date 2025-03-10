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
    published_time : formatTimestamp(item.photo?.high_resolution?.timestamp || Date.now()),
    price: item.price?.amount ? parseFloat(item.price.amount) : null,
    brand: item.brand_title || "Unknown",  
    url: item.url
  }));
};
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convertir en millisecondes
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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
            "Cookie":"v_udt=cUp1RmhEblhYb0Y1YWFOT29BdkxaR0RXS1Zpci0tNkRoSnJiR2hpL2lJZFRnSy0tdGRYS2tKUS9DSHpFQk5mUEZnbHBKZz09; anonymous-locale=fr; anon_id=d743d0dd-3af2-41fe-823a-0133d2d223b7; ab.optOut=This-cookie-will-expire-in-2026; v_sid=ce6fb5e0-1741624240; datadome=8zNnhrL84nFPe3Ljg2i2GyYIr7W3vyAeWfPoZHWJmaFhnQ2nMlg_6nHhost7McIhXWbb2gsTmtrb8WUafZM14GgfTa3X2jkO40YJTruqz7oIHAdIVoTOnoYkzOegnXCn; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+10+2025+19%3A30%3A25+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=d743d0dd-3af2-41fe-823a-0133d2d223b7&interactionCount=90&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2025-01-06T21:45:19.777Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjMxNDI0LCJzaWQiOiJjZTZmYjVlMC0xNzQxNjI0MjQwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2Mzg2MjQsInB1cnBvc2UiOiJhY2Nlc3MifQ.Du__TPNF_wILcyAsdA1cIq6M_IlUiI8YpCjqP4DjmvZ0nlnkBso6-tBjfaroHP_wBHWNr1cSmujEFeCKTgRy21whzO6VSxEmVQJvKJE1Iwf9fQqThRpw9OF5QYEzJIylapBPABKgGmsvn6HZDlTFfmfSFzYrKHrsMM8FjeDFYR5RQgH4aQY3ERJsu9FuoB1f6GX-X403bvISqtpZBKGlBgnT0AT8s_MS9pWYc3h9q08hpqi57Uy9EOqbVKqKiWRGF9SUhyGr4fgMNiwoQwwygvfURBzZR_7Fxn7VMwR1Hwi1z_jXnQDOQO98mV1raXOyOXPP1ExrRNGvbfWLiYdDYQ; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjMxNDI0LCJzaWQiOiJjZTZmYjVlMC0xNzQxNjI0MjQwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMzYyMjQsInB1cnBvc2UiOiJyZWZyZXNoIn0.UMYHm5thene1glqC6Y8kdhsWb8dudB9IbUMhX74TF10JV9qrq5TLA1jkgnS2mBQEv7Iiiq25nYr1LJLWXQkkGIVGVXUjt3Ir2NhmLC79lD3SIO2dTPA82hPBw4DikKPPqO91cbpSJhlD0eSBSdDJjyUaHAfDq-WdlRqxplE1Jf6t5wIRD1jVLt7xGHkETKHWVeeMkZdJfMFeZkkgYHINwv13BSqWxQ8ww_qI8cxi15kIg2aAXfaMO5BbAZpV3FoWkHURtru0BgcP1rOftgigEPP3gtbsS8Bq0K0UdlKyMD6V_iaZWMmZcLctmd9mpN2u3UFcgsi3nkuliYvfA4HVgw; v_sid=41dcca154ffdc00969dc2eebe0bc8376; viewport_size=1536; _vinted_fr_session=OTVuUCt4bFBvOWMvc3FYK09RTU5BZmlJYXJSUEs0T2NCOVI1ZndUSzBjMlpPSkY5dW84OUU1NFgxWkVUYi9VbFZ4bFdDZ3FzMnhWbXlJcHptSmpFZFJ0c0Y2dXJFenZrT3BTcGJ3bUU0ampkZ2VxZnJxT1RZbmJpYlVvL3FGaDJHUitCWHk4ZGg5NU1hYzNRZER0ckowOFpQK0h4OHlBNXV1dlVsMnREd0xRYndScHZibGc4cFAxdHkvN3pLdEtETmJTMk5ScFZyNDUxMFJSS0RyN2xtbmllSGwwUGJKUCt1SGJ3REMzZ01FdllvaU12bjhBbERVaC9FcVZlcWxwRnljQ0pQNzlGTDhkaXUyRkpmMkFJK2lPRVNhSWZJM2QwWWlaOEJxNWw0RHVOSTdWT2Nvb3R3VlJCTkNSVDNORlhuaUVxdUlKcDRmZVU1K3dsVCt0YzYwTDF2U2tMYlJVYlBvd1c0dXFoTzYvdkc4dGNwK013aVRwMDkySGcyZEZucXFuS25sZzlzeVhvOFRHVVdJOTNvZ0d4cEJzekJRQ2FtZ3BpVFU0aTlvMEtpd1ZBeXEyb2JEdEtxTVJGUHkreU1jalg2aXg2S09Yc2kxUWZRSUEzN0Zua1lWMk9lc0dBbXA5eHkzUmNBbFpzdlN0OEJueEU4ZFhDeUxYeWFkMy9tWXZUaVZRK1ZYVXMrdW9MeFEzem5oYWpBRFVGakU1VUg2M1huSERxMGpUNmo2dEh1UEJPa2hVbU9ObXJ1bVVOT3R3aGRYajFub21wWkFBUWlvUlFoczRDN0VEUlJ3NnVsRDMyWnIyME0vZFQ3MWVkdnN1bERYQTlERUhkQUtYZ3BiVjJ1VUtXTktFakMzVGNXTjZ1Q2RSOEQ1NTc2QWRFK1Y4NVZhZlFkdDBxNkdHbkpSTXdvK283OHVBdkxmbGtPdDJIN2dVWTE4WjRDY2MvL0ZYazFJcXpSRmRVdjFYQU1aOUZsOER0N1Ivc1QxbmJxSzlpcjAwN1BQMkdnUHZncTJkWFJ0TnYwNU01VE1xUTMrcURITW04SkhzRXUwT25hU3IyUGlVR005TjkyM2t4SEFTZWJITEtrS216dlp0Zzhtbml1QUlPSE5yeTRFb3hFYmhSSVVwb2dGbGIrbXIyYWlMcnBEblEyMlFLM2szYmw0ZzdmcXpMdmg4WVBjQ0l0YnR6SS96TG1WTVIvaVlGVjU1YlA1bXI1TnRvUHBUaW9SVGhldVRwWVd5eWdCQ090NTN0NDNnY2dXMmhPbHpFb2tKWEpkSDk5U2VEc0s4eFduL29zSWtwVlRnME5YaFhrNUlyTVMyQ2IzQWNtM0hNSXIzSnFIUkxocFRTSVlEYkwwaTlld3hjb1hCM2dPemxMQWxtQi9nUEc1MmQvZlk1UmJtRFFjVjFPSzg1L1VlY1V2UDRVaHlqZ1RDbFV0ZzVFYmVJVTB1YnUvZ1FSNW9RTnJBSXJqcS9tWUt2QVh1N3Fnd3VYaStoODNBL2FMQkVZc0tsNnJvd1pWNFZGby9uT09XZUxQVVhVS2lUYnB2SDdpSllGSmgrM0VYSHBXZHJOa2ZSZTl6eTM3bWFrMWZsRzdTaURMS0dXbTZZZ05LWU1lZXJVSmIycnpqTFVqUmhsaEZ0czAvVFFpUjY4ZUxHOHVsRko2QTJpVDRBbUF4dlUwMlNiS3duci9sUS92dGFxdjNNQ2g0anRiQlU5VGVHRWJ5Mk4zTHJpVXF2NjhwcDY5N0lYalJnR1FldmdESWdOUEZBUDF1MmlobUtrLzVtZTNFNFVWRU4zYVI0cldZbzd6ZGttSGljbXV1SEtTWGgzbWU5WHk0KzlRWTMwVUp5RklLMVN6TVRkYk9uZ0JmN1YrMVR4UmZuay9FRXFqL2ltMGJ3MjJobDE1ZEZ6MzBnbnRpYVpyd0ZmYUFXT2ZHMDc3eTJqOGRkeFlWNCtaOHByT1FjZG1vVDVPbVBRWFFmM0FGUlM4SmxoQkR6eVVtRkJPZVdnOFhKa2tQM3lDOGpnRWlZSTJIZm5SVDBrQVpuVXRzbHZaOENsTVQvWHZjZFhQNmRzTk9OeHBVTHVRK25RZUZiWmZsVTF3SThNcFpPNUYzMjFRWmpFd0V1bTFqaGRUQ0dvcWxiaGFmUzBxOGZRd0VxenNCSkNLVTBnVDZ0Q3V4eDlNV0UrekxvQ3ArQ3FLeUpadEpsNEZmdnpQdW9UNTFOTDlienEvZXZpMTJJenRyUEdET0FmaC9PTEVHWk95TDFtTmhjWUFaL1dZZllWRTR4VTlBc2hpeTl5ME0rcWQ3WjBHZU9VRW9EZW1uVFhyaWhMbStXTk5KK0VxRzFFNXhQYmtiNDNaRkpkNUp5UjRWMFEwd3cyY1VRN3k3VC0tTFRFcXo0ZWlqYytZeGRySE5BMGJoZz09--279aa5a9c967b11a916963000b731352eba60710; __cf_bm=E2MivL9S5CiH1w42_wbTL8gjYyjEX7m8dG67UEt0A4w-1741631476-1.0.1.1-Xh1E7P83JaRj3SNEpwnSJT48TwDjTrcV2SWo9HcwnYtmxwPrjdUPMtd7d_ke2zzRPP9DzUbYOnEG4JdpAeRZVarukYbD4tPsLOWHTijeANQR7Nwb6zfoBMztVEyFiDel; banners_ui_state=PENDING; cf_clearance=Z3yrCaPQjIz4YpFgZaUKKQudBuP4gdYP991K9OfcLnI-1741631482-1.2.1.1-4fz1N7JDzUX7nKXNNtpICFVesEOgbcE.L2LJak5SHYcfcMyVYlaa.H2pWt0SdJ5vZu0WZbozjg3wEI5Ual.u2ey9rKDq7hW3juZREuKdrLx0xjNXVD_Orod0x7nj_uByizGLAB74ymhQCSAwxxxmSf3HEUVq4FrKit0uIKhrkyqLLIeuVVHCSXAas7xpeCGpsDWW1csbJnLaZjJVvDRDFGDRBfmOIqD9ER4qyWLrrD7kJbJA5RFSepHjhf3sEEwfIRCf2bMQQbLOWaIaPNd9tbbofW2I9t9OXfKkl5BGkIlkPwMHd.V5B9qyTU7s0dvXiiRnEO1aoccBG1xcGq5gc9h1SD2lxFGqQwR1Ke2PL2ZJjswElRoIm78GnFHHtinwMF3u8t8MpfA5FZyZtdXud2a5ARSqogv2HunWovwF0Ws"
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
  