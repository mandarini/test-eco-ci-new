export function getPublishedVersion(): string {
  process.env['PUBLISHED_VERSION'] =
    process.env?.['PUBLISHED_VERSION'] || 'latest';
  return process.env?.['PUBLISHED_VERSION'] as string;
}
