
import { fetchGithubDirItemsFromHtml } from '@/utils/git-crawling';

describe('fetchGithubDirFileNames', () => {
  it('should return file names for sepolia', async () => {
    const items = await fetchGithubDirItemsFromHtml('sepolia');
    console.log('items', items);
    expect(Array.isArray(items)).toBe(true);
    expect(typeof items[0]).toBe('string');
  });

  // it('should return file names for mainnet', async () => {
  //   const files = await fetchGithubDirFileNames('mainnet');
  //   expect(Array.isArray(files)).toBe(true);
  //   expect(typeof files[0]).toBe('string');
  // });
});