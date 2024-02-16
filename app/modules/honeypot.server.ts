import { Honeypot } from "remix-utils/honeypot/server"

const honeypot = new Honeypot({
  encryptionSeed: undefined,
  nameFieldName: "name___confirm",
  randomizeNameFieldName: false,
  validFromFieldName: "from__confirm",
})

export default honeypot
