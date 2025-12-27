export function toSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Замінити пробіли на дефіси
    .replace(/[^\w\-]+/g, "") // Видалити все, що не букви/цифри/дефіс
    .replace(/\-\-+/g, "-") // Замінити подвійні дефіси на одинарні
    .replace(/^-+/, "") // Видалити дефіс на початку
    .replace(/-+$/, ""); // Видалити дефіс в кінці
}
