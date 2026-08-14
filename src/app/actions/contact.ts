"use server";

export async function getWeb3FormsKey() {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) {
    throw new Error("Missing Web3Forms Access Key");
  }
  return key;
}
