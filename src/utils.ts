import crypto from "crypto-js";

export const createHmacString = (message, key) => {
  const keyByte = crypto.enc.Utf8.parse(key);
  const messageByte = crypto.enc.Utf8.parse(message);
  const signature = crypto.enc.Hex.stringify(
    crypto.HmacSHA256(messageByte, keyByte)
  );
  return signature;
};

