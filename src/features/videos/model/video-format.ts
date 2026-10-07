const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const BYTES_PER_MEGABYTE = 1_048_576;
const MEGABYTES_PER_GIGABYTE = 1024;
const TWO_DIGITS = 2;

const sizeFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

function padTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS, '0');
}

/** «6:12» o «1:05:30»: lo que se ve en la miniatura de un vídeo. */
export function formatVideoDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const restSeconds = seconds % SECONDS_PER_MINUTE;
  if (hours === 0) return `${String(minutes)}:${padTwoDigits(restSeconds)}`;
  return `${String(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(restSeconds)}`;
}

/** «320 MB» o «1,5 GB», con coma decimal. */
export function formatStorageSize(bytes: number): string {
  const megabytes = bytes / BYTES_PER_MEGABYTE;
  if (megabytes < MEGABYTES_PER_GIGABYTE) return `${sizeFormatter.format(megabytes)} MB`;
  return `${sizeFormatter.format(megabytes / MEGABYTES_PER_GIGABYTE)} GB`;
}
