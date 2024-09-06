export class TandaHelper {
  static serviceProvider(msisdn: string, airtime: boolean = false): string {
    const safaricom =
      /(?:0)?((?:(?:7(?:(?:[01249][0-9])|(?:5[789])|(?:6[89])))|(?:1(?:[1][0-5])))[0-9]{6})$/;
    const airtel =
      /(?:0)?((?:(?:7(?:(?:3[0-9])|(?:5[0-6])|(8[5-9])))|(?:1(?:[0][0-2])))[0-9]{6})$/;
    const telkom = /(?:0)?(77[0-9][0-9]{6})/;
    const equitel = /0?(76[3-6][0-9]{6})/;

    if (!airtime) {
      if (safaricom.test(msisdn)) {
        return "MPESA";
      } else if (airtel.test(msisdn)) {
        return "AIRTELMONEY";
      } else if (telkom.test(msisdn)) {
        return "TKASH";
      } else if (equitel.test(msisdn)) {
        return "EQUITEL";
      } else {
        return "0";
      }
    } else {
      if (safaricom.test(msisdn)) {
        return "SAFARICOM";
      } else if (airtel.test(msisdn)) {
        return "AIRTEL";
      } else if (telkom.test(msisdn)) {
        return "TELKOM";
      } else {
        return "0";
      }
    }
  }
}
