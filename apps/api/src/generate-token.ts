import crypto from "crypto";
import dayjs from "dayjs";

function generateKey() {
  let count = 10;
  while (count--) {
    const key = crypto
      .randomBytes(8)
      .toString("base64")
      .replace(/[+/=]/g, "")
      .substring(0, 8);

    console.log(`${key} ${dayjs().add(6, "month").format("YYYY-MM-DD")}`);
  }
}

generateKey();
