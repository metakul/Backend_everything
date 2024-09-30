import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";

export const genAPIKey = (childLogger:any) => {
    //create a base-36 string that contains 30 chars in a-z,0-9
    logWithMessageAndStep(childLogger, "Generate APIKey step", "APIKEY", "Generating APIKey", "Generating APIKey","info");
      const apikey=[...Array(30)]
      .map(() => ((Math.random() * 36) | 0).toString(36))
      .join('');
      logWithMessageAndStep(childLogger, "Generate APIKey step", "APIKEY", "Generated APIKey", JSON.stringify(apikey),"info");
      return  apikey
  };