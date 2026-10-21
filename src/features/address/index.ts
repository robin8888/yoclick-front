// API pública de la feature: lo único que otras features pueden importar.
export { AddressField } from './components/AddressField';
export { FormAddressField } from './components/FormAddressField';
export { FormCityField } from './components/FormCityField';
export {
  getCountryCodeForTimeZone,
  getDeviceCountryCode,
  type AddressCountryCode,
} from './model/address-kind';
export {
  addressValueSchema,
  buildTypedAddress,
  EMPTY_ADDRESS,
  type AddressValue,
} from './model/address-value';
