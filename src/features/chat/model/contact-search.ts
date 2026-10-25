function toSearchableText(text: string): string {
  return text
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Las personas cuyo nombre contiene lo escrito, sin distinguir mayúsculas ni tildes; vacío = todas. */
export function filterContactsByName<Contact extends { fullName: string }>(
  contacts: readonly Contact[],
  searchText: string,
): Contact[] {
  const searchedName = toSearchableText(searchText);
  if (searchedName === '') return [...contacts];
  return contacts.filter((contact) => toSearchableText(contact.fullName).includes(searchedName));
}
