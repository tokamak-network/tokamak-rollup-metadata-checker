import { fetchGithubDirItemsFromHtml } from './git-crawling';
import { fetchGithubMetadataFromHtml } from './git-crawling';

// describe('fetchGithubDirItemsFromHtml', () => {
//   it('should return an array of file names (without .json) for sepolia', async () => {
//     const files = await fetchGithubDirItemsFromHtml('sepolia');
//     expect(Array.isArray(files)).toBe(true);
//     expect(files.length).toBeGreaterThan(0);
//     for (const name of files) {
//       expect(typeof name).toBe('string');
//       expect(name.startsWith('0x')).toBe(true);
//       expect(name.endsWith('.json')).toBe(false);
//     }
//   });

//   it('should return an array of file names for mainnet (if exists)', async () => {
//     const files = await fetchGithubDirItemsFromHtml('mainnet');
//     expect(Array.isArray(files)).toBe(true);
//     // mainnet may be empty, so just check array type
//   });

//   it('should default to sepolia if network is null', async () => {
//     const files = await fetchGithubDirItemsFromHtml(null);
//     expect(Array.isArray(files)).toBe(true);
//     expect(files.length).toBeGreaterThan(0);
//   });
// });

// Skeleton for fetchGithubMetadataFromHtml test
// Uncomment and implement when the function is available

describe('fetchGithubMetadataFromHtml', () => {
  it('should fetch and parse metadata JSON from a GitHub HTML page', async () => {
    const metadata = await fetchGithubMetadataFromHtml(
        'sepolia', '0x93d294534e8a90fef10fa261f97032f9f6faef5d');
    // expect(metadata).toBeDefined();
    // expect(metadata).toHaveProperty('name');
    console.log('metadata', metadata);
  });
});